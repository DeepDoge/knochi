import { PostIndexer, PostStore } from "@root/contracts/connect";
import { JsonRpcProvider, toBeHex } from "ethers";
import { currentConfig } from "~/features/config/state";
import { db } from "~/utils/db/client";
import { Bytes32Hex } from "~/utils/hex";

export type GetFeedParameters = {
	feedId: Bytes32Hex;
	cursor: bigint | null;
	direction: -1n | 1n;
	limit: bigint;
};

export type FeedPost = {
	origin: `0x${string}`;
	sender: `0x${string}`;
	id: bigint;
	index: bigint;
	time: number;
	contentBytesHex: string;
};

export async function getFeed({ feedId, cursor, direction, limit }: GetFeedParameters): Promise<FeedPost[]> {
	const config = await currentConfig.val;
	const network = Object.values(config.networks)[0];

	if (!network) {
		return [];
	}

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
			indexerContract.get(feedId, index).then(async (postMetadata) => {
				const [origin, postId, sender, time] = postMetadata;
				const postIdHex = toBeHex(postId);

				let dbPost = await db.find("Post").byKey([sender, postIdHex]);

				if (!dbPost) {
					const proxyContract = PostStore.connect(provider, sender);
					dbPost = {
						proxyContractAddress: sender,
						postIdHex,
						content: await proxyContract.get(postId),
					};
					await db.add("Post").values(dbPost).execute();
				}

				return {
					origin,
					sender,
					id: postId,
					index,
					time: Number(time) * 1000,
					contentBytesHex: dbPost.content,
				} satisfies FeedPost;
			}),
		);
	}

	return await Promise.all(postPromises);
}
