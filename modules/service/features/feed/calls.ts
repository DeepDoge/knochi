import { db } from "@/db";
import { Config } from "@/features/config/module";
import { Bytes32Hex } from "@/types";
import { IEternisIndexer, IEternisProxy } from "@modules/contracts/connect";
import { JsonRpcProvider, toBeHex } from "ethers";

export type FeedPost = {
	origin: `0x${string}`;
	sender: `0x${string}`;
	id: string;
	index: bigint;
	time: number;
	contentBytesHex: string;
};
export async function getFeed(
	feedId: Bytes32Hex,
	cursor: bigint | null,
	direction: -1n | 1n,
	limit: bigint,
): Promise<FeedPost[]> {
	const config = await Config.get();
	const provider = new JsonRpcProvider(config.networks[0].providers[0]);
	const indexerContract = IEternisIndexer.connect(provider, config.networks[0].contracts.EternisIndexer);

	const postPromises: Promise<FeedPost>[] = [];
	const length = await indexerContract.length(feedId);
	cursor ??= length - 1n;
	for (let i = 0n; i < limit; i++) {
		const index = cursor + i * direction;
		if (index < 0) break;
		if (index >= length) break;

		postPromises.push(
			indexerContract.get(feedId, index).then(async (postMetadata) => {
				const [origin, sender, postId, time] = postMetadata;
				const postIdHex = toBeHex(postId);

				let dbPost = await db.find("Post").byKey([sender, postIdHex]);

				if (!dbPost) {
					const proxyContract = IEternisProxy.connect(provider, sender);
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
					id: toBeHex(postId),
					index,
					time: Number(time) * 1000,
					contentBytesHex: dbPost.content,
				} satisfies FeedPost;
			}),
		);
	}

	return await Promise.all(postPromises);
}
