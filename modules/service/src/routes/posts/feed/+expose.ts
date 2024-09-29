import { Bytes32Hex } from "@root/app/src/utils/hex";
import { IKnochiIndexer, IKnochiSender } from "@root/contracts/connect";
import { JsonRpcProvider, toBeHex } from "ethers";
import { db } from "~/db";
import { getConfig } from "~/routes/config/+expose";
import { memoizeUntilSettled } from "~/utils/memoize";

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

export const getFeed = memoizeUntilSettled(
	async ({ feedId, cursor, direction, limit }: GetFeedParameters): Promise<FeedPost[]> => {
		const config = await getConfig();
		const provider = new JsonRpcProvider(config.networks[0].providers[0]);
		const indexerContract = IKnochiIndexer.connect(provider, config.networks[0].contracts.KnochiIndexer);

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
						const proxyContract = IKnochiSender.connect(provider, sender);
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
	},
);
