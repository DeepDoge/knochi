import { Config } from "@/config";
import { JsonRpcProvider, toBeHex } from "ethers";
import { IEternisIndexer, IEternisProxy } from "../contracts";
import { Bytes32 } from "../types";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const feedId = Bytes32.parse(url.searchParams.get("feedId"));

	const config = await Config.get();

	const provider = new JsonRpcProvider(config.networks[0].providers[0]);

	const indexerContract = IEternisIndexer.connect(provider, config.networks[0].contracts.EternisIndexer);

	const length = await indexerContract.length(feedId);
	const posts = await Promise.all(
		new Array<null>(Number(length)).fill(null).map(async (_, index) => {
			const postMetadata = await indexerContract.get(feedId, BigInt(index));
			const [origin, sender, postId, time] = postMetadata;
			const proxyContract = IEternisProxy.connect(provider, sender);
			const content = await proxyContract.get(postId);

			return {
				origin,
				sender,
				postId: toBeHex(postId),
				time: Number(time) * 1000,
				content,
			};
		}),
	);

	return new Response(JSON.stringify(posts), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
