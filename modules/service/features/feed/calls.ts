import { db } from "@/db";
import { Config } from "@/features/config/module";
import { Bytes32Hex } from "@/types";
import { IEternisIndexer, IEternisProxy } from "@modules/contracts/connect";
import { JsonRpcProvider, toBeHex } from "ethers";
import { min } from "extra-bigint";

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
	startIndexInclusive: bigint = 0n,
	limit: bigint = 256n,
): Promise<FeedPost[]> {
	const config = await Config.get();

	const provider = new JsonRpcProvider(config.networks[0].providers[0]);

	const indexerContract = IEternisIndexer.connect(provider, config.networks[0].contracts.EternisIndexer);

	const length = await indexerContract.length(feedId);
	const startInclusive = startIndexInclusive;
	const endExclusive = min(startInclusive + limit, length);
	const posts = await Promise.all(
		new Array<null>(Number(endExclusive - startInclusive)).fill(null).map(async (_, i) => {
			const index = startInclusive + BigInt(i);
			const postMetadata = await indexerContract.get(feedId, BigInt(index));
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

	return posts;
}
