import { JsonRpcProvider, toBeHex } from "ethers";
import { Config } from "./config";
import { IEternisIndexer, IEternisProxy } from "./contracts";
import { db } from "./db";
import { Bytes32 } from "./types";

export function hello(name: string) {
	return `Hello, ${name}!`;
}

export async function getConfig() {
	return await Config.get();
}

export async function getFeed(feedId: string) {
	Bytes32.parse(feedId);
	const config = await Config.get();

	const provider = new JsonRpcProvider(config.networks[0].providers[0]);

	const indexerContract = IEternisIndexer.connect(provider, config.networks[0].contracts.EternisIndexer);

	const length = await indexerContract.length(feedId);
	const posts = await Promise.all(
		new Array<null>(Number(length)).fill(null).map(async (_, index) => {
			const postMetadata = await indexerContract.get(feedId, BigInt(index));
			const [origin, sender, postId, time] = postMetadata;
			const postIdHex = toBeHex(postId);

			let content = await db.find("Post").byKey([sender, postIdHex]);

			if (!content) {
				const proxyContract = IEternisProxy.connect(provider, sender);
				content = {
					proxyContractAddress: sender,
					postIdHex,
					content: await proxyContract.get(postId),
				};
				await db.add("Post").values(content).execute();
			}

			return {
				origin,
				sender,
				postId: toBeHex(postId),
				time: Number(time) * 1000,
				content,
			};
		}),
	);

	return posts;
}
