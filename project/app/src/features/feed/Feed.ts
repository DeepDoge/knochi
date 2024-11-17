import { PostIndexer } from "@root/contracts/connect";
import { JsonRpcProvider, solidityPackedKeccak256 } from "ethers";
import { Config } from "~/shared/config";
import { FeedId } from "~/shared/schemas/feed";
import { Address } from "~/shared/schemas/primatives";
import { Post } from "../post/Post";

export namespace Feed {
	export type Init = {
		id: FeedId;
		limit: number;
		indexers: Feed.Indexer[];
	};
	export type Direction = {
		indexIterator(length: bigint): Iterator<bigint, void, unknown>;
		isCandidateOfOtherSourceBetter(candidatePost: Post, selectedPost: Post): boolean;
	};
	export type Indexer = { chainId: bigint; address: Address };
}

export class Feed {
	public readonly id: FeedId;
	public readonly indexers: Feed.Indexer[];
	public readonly limit: number;

	constructor(init: Feed.Init) {
		this.id = init.id;
		this.limit = init.limit;
		this.indexers = init.indexers;
	}

	public static PostReplies(params: { post: Post; config: Config }) {
		const { post, config } = params;
		const { feedId, index, indexerAddress, network } = post.loadedWith;

		const repliesFeedId = solidityPackedKeccak256(
			["string", "uint256", "address", "bytes32", "uint256"],
			["replies", network.chainId, indexerAddress, feedId, index],
		) as FeedId;

		return new Feed({
			id: repliesFeedId,
			indexers: Object.values(config.networks).map((network) => ({
				chainId: network.chainId,
				address: network.contracts.PostIndexer,
			})),
			limit: 64,
		});
	}

	public static ProfilePosts(params: { address: Address; config: Config }) {
		const { address, config } = params;
		const profileFeedId = FeedId().parse(`0x00${address.slice(2)}${"00".repeat(32 - 1 - 20)}`);

		return new Feed({
			id: profileFeedId,
			indexers: Object.values(config.networks).map((network) => ({
				chainId: network.chainId,
				address: network.contracts.PostIndexer,
			})),
			limit: 64,
		});
	}

	public async *iter(params: {
		config: Config;
		direction: Feed.Direction;
	}): AsyncIterator<Post[], void, unknown> {
		const { config, direction } = params;

		const sources = await Promise.allSettled(
			this.indexers.map(async (indexer) => {
				const network = config.networks[`${indexer.chainId}`];
				if (!network) throw new Error(`Network is missing: ${indexer.chainId}`);
				const provider = new JsonRpcProvider(network.providers[0]);
				const indexerContract = PostIndexer.connect(provider, indexer.address);
				const length = await indexerContract.length(this.id);
				return {
					indexer,
					network,
					provider,
					indexerContract,
					length,
					indexIterator: direction.indexIterator(length),
					queue: [] as Post[],
				};
			}),
		).then((results) =>
			results.filter((result) => result.status === "fulfilled").map(({ value }) => value),
		);

		while (true) {
			await Promise.allSettled(
				sources.map(async (source) => {
					const take = Math.max(0, this.limit - source.queue.length);
					if (!take) return;

					const { network } = source;

					const posts: Promise<Post>[] = [];

					for (let n = 0; n < take; n++) {
						const indexIterResult = source.indexIterator.next();
						if (indexIterResult.done) break;

						posts.push(
							Post.load({
								network,
								indexerAddress: source.indexer.address,
								feedId: this.id,
								index: indexIterResult.value,
							}),
						);
					}

					source.queue.push(
						...(await Promise.allSettled(posts))
							.map((value) => {
								if (value.status === "rejected") {
									console.error(value.reason);
								}
								return value;
							})
							.filter((result) => result.status === "fulfilled")
							.map((result) => result.value),
					);
				}),
			);

			const result: Post[] = [];

			while (result.length < this.limit) {
				let selectedSource: (typeof sources)[number] | null = null;

				for (const candidateSource of sources) {
					const candidatePost = candidateSource.queue.at(0);
					const selectedPost = selectedSource?.queue.at(0);

					if (!candidatePost) continue;

					if (!selectedPost) {
						selectedSource = candidateSource;
						continue;
					}

					if (direction.isCandidateOfOtherSourceBetter(candidatePost, selectedPost)) {
						selectedSource = candidateSource;
						continue;
					}
				}

				if (!selectedSource) break;
				const nextPost = selectedSource.queue.shift();
				if (!nextPost) break;
				result.push(nextPost);
			}

			if (!result.length) break;
			yield result;
		}
	}
}
