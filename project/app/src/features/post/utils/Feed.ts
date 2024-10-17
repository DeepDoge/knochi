import { PostIndexer, PostStore } from "@root/contracts/connect";
import { JsonRpcProvider, toBeHex } from "ethers";
import { bigint, literal, object, union, z } from "zod";
import { Config, currentConfig } from "~/features/config/state";
import { Post } from "~/features/post/utils/Post";
import { PostIndex } from "~/features/post/utils/PostIndex";

import { db } from "~/utils/db/client";
import { BytesHex, Uint } from "~/utils/solidity/primatives";

export class Feed {
	public readonly id: BytesHex<32>;
	public readonly direction: Feed.Direction;
	public readonly chains: Feed.Chain[];
	public readonly limit: number;

	constructor(id: BytesHex<32>, direction: Feed.Direction, limit: number, chainIds: bigint[]) {
		this.id = id;
		this.direction = direction;
		this.limit = limit;
		this.chains = chainIds.map((chainId) => {
			return {
				chainId,
				index: direction > 0 ? 0n : -1n,
				queue: [],
			};
		});
	}

	public async *previousGenerator(): AsyncGenerator<Post[]> {}

	public async *nextGenerator(): AsyncGenerator<Post[]> {
		while (true) {
			const result: Post[] = [];

			const resultPerNetwork = await Promise.all(
				this.chains.map(async (chain) => {
					const network = (await currentConfig.val).networks[`${chain.chainId}`];
					if (!network) {
						return [];
					}

					const provider = new JsonRpcProvider(network.providers[0]);
					const indexerContract = PostIndexer.connect(provider, network.contracts.PostIndexer);

					const length = await indexerContract.length(this.id);

					const posts: Post[] = [];

					for (let i = 0n; i < this.limit; i++) {
						const index = chain.index + i * this.direction;
						if (index < 0) break;
						if (index >= length) break;

						const post = await PostIndex.load(network, this.id, Uint("256").parse(index));
					}
				}),
			);

			if (!result.length) break;
			yield result;
		}
	}
}

export namespace Feed {
	export type Direction = typeof Direction._output;
	export const Direction = union([literal(-1n), literal(1n)]);

	export type Chain = typeof Network._output;
	export const Network = object({ chainId: bigint(), index: bigint(), queue: z.instanceof(Post).array() });
}

export async function getFeed(params: GetFeedParameters) {
	const { feedId, cursor, direction, limit } = params;

	const config = await currentConfig.val;
	const networks = Object.values(config.networks);

	const posts = await Promise.all(
		networks.map(async (network) => {
			const posts = await getFeedAtNetwork(network, params);
			return posts;
		}),
	).then((posts) => posts.flat(1));

	if (direction > 0) {
		posts.sort((a, b) => Number(a.time - b.time));
	} else {
		posts.sort((a, b) => Number(b.time - a.time));
	}
}

export async function getFeedAtNetwork(
	network: Config.Network,
	{ feedId, cursor, direction, limit }: GetFeedParameters,
): Promise<FeedPost[]> {
	const provider = new JsonRpcProvider(network.providers[0]);
	const indexerContract = PostIndexer.connect(provider, network.contracts.PostIndexer);

	const postPromises: Promise<FeedPost>[] = [];
	const length = await indexerContract.length(feedId);

	cursor ??= length - 1n;
	for (let i = 0n; i < limit; i++) {
		const index = cursor + i * direction;
		if (index < 0) break;
		if (index >= length) break;

		postPromises.push(
			(async () => {
				let dbPostIndex = await db
					.find("PostIndex")
					.byKey([network.contracts.PostIndexer, feedId, toBeHex(index)]);

				if (!dbPostIndex) {
					const postIndex = await indexerContract.get(feedId, index);
					const [author, postId, postStore, time] = postIndex;
					dbPostIndex = {
						feedId,
						authorAddress: author,
						indexerAddress: network.contracts.PostIndexer,
						indexHex: toBeHex(index),
						postIdHex: toBeHex(postId),
						storeAddress: postStore,
						time_seconds: time,
					};
					await db.add("PostIndex").values(dbPostIndex).execute();
				}

				let dbPost = await db.find("Post").byKey([dbPostIndex.storeAddress, dbPostIndex.postIdHex]);

				if (!dbPost) {
					const storeContract = PostStore.connect(provider, dbPostIndex.storeAddress);
					dbPost = {
						storeAddress: dbPostIndex.storeAddress,
						postIdHex: dbPostIndex.postIdHex,
						content: await storeContract.get(BigInt(dbPostIndex.postIdHex)),
					};
					await db.add("Post").values(dbPost).execute();
				}

				return {
					chainId: network.chainId,
					author: dbPostIndex.authorAddress,
					store: dbPostIndex.storeAddress,
					id: BigInt(dbPostIndex.postIdHex),
					index: BigInt(dbPostIndex.indexHex),
					time: dbPostIndex.time_seconds,
					content: PostContent.fromBytes(dbPost.content),
				} satisfies FeedPost;
			})(),
		);
	}

	return await Promise.all(postPromises);
}
