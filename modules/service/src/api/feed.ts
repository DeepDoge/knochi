import { JsonRpcProvider, toBeHex } from "ethers";
import { IEternisIndexer, IEternisProxy } from "../contracts";
import { Bytes32 } from "../types";

const jsonRpcProvider = new JsonRpcProvider("https://sepolia.infura.io/v3/a104675596c145f29f50bf72c27a82f3");

export async function GET(request: Request) {
	const url = new URL(request.url);
	const feedId = Bytes32.parse(url.searchParams.get("feedId"));

	const indexerContract = IEternisIndexer.connect(jsonRpcProvider);

	const length = await indexerContract.length(feedId);
	const posts = await Promise.all(
		new Array<null>(Number(length)).fill(null).map(async (_, index) => {
			const postMetadata = await indexerContract.get(feedId, BigInt(index));
			const [origin, sender, postId, time] = postMetadata;
			const proxyContract = IEternisProxy.connect(jsonRpcProvider, sender);
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
