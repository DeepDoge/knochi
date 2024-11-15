import { PostIndexer } from "@root/contracts/connect";
import { JsonRpcProvider, solidityPackedKeccak256 } from "ethers";
import { Config } from "~/shared/config";
import { FeedId } from "~/shared/schemas/feed";
import { Address } from "~/shared/schemas/primatives";
import { Post } from "../post/Post";

export namespace Feed {
	export type Init = {
		id: FeedId;
		direction: Feed.Direction;
		limit: number;
		indexers: Feed.Indexer[];
	};
	export type Direction = 1n | -1n;
	export type Indexer = { chainId: bigint; address: Address };
}

export class Feed {
	public readonly id: FeedId;
	public readonly direction: Feed.Direction;
	public readonly indexers: Feed.Indexer[];
	public readonly limit: number;

	constructor(init: Feed.Init) {
		this.id = init.id;
		this.direction = init.direction;
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
			direction: -1n,
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
			direction: -1n,
			indexers: Object.values(config.networks).map((network) => ({
				chainId: network.chainId,
				address: network.contracts.PostIndexer,
			})),
			limit: 64,
		});
	}

	public async *previousGenerator(): AsyncGenerator<Post[]> {
		throw new Error("Not Implemented");
		yield [];
	}

	public async *nextGenerator(params: { config: Config }) {
		const { config } = params;

		const sources = this.indexers.map((indexer) => {
			return {
				indexer,
				index: this.direction > 0 ? 0n : null,
				queue: [] as Post[],
			};
		});

		while (true) {
			await Promise.allSettled(
				sources.map(async (source) => {
					const take = Math.max(0, this.limit - source.queue.length);
					if (!take) return;

					const network = config.networks[`${source.indexer.chainId}`];
					if (!network) {
						return [];
					}

					const provider = new JsonRpcProvider(network.providers[0]);
					const indexerContract = PostIndexer.connect(provider, source.indexer.address);

					// TODO: Use cached length and load optimisticly, and dont give `done` until remote length is fetched.
					// TODO: After getting remote length fetch the rest on the next call.
					const length = await indexerContract.length(this.id);
					source.index ??= length - 1n;

					const posts: Promise<Post>[] = [];

					for (let i = 0n; i < take; i++) {
						const index = source.index + i * this.direction;
						if (index < 0) break;
						if (index >= length) break;

						posts.push(
							Post.load({
								network,
								indexerAddress: source.indexer.address,
								feedId: this.id,
								index,
							}),
						);
					}
					source.index += BigInt(posts.length) * this.direction;

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
				let nextChain: (typeof sources)[number] | null = null;

				for (const chain of sources) {
					const firstPost = chain.queue.at(0);
					const nextPost = nextChain?.queue.at(0);

					if (!firstPost) continue;

					if (!nextPost) {
						nextChain = chain;
						continue;
					}

					if (
						this.direction > 0 ?
							firstPost.createdAt > nextPost.createdAt
						:	firstPost.createdAt < nextPost.createdAt
					) {
						nextChain = chain;
						continue;
					}
				}

				if (!nextChain) break;
				const nextPost = nextChain.queue.shift();
				if (!nextPost) break;
				result.push(nextPost);
			}

			if (!result.length) break;
			yield result;
		}
	}
}
