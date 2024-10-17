import { PostIndexer, PostStore } from "@root/contracts/connect";
import { JsonRpcProvider, toBeHex } from "ethers";
import { Config } from "~/features/config/state";
import { Post } from "~/features/post/utils/Post";
import { db } from "~/utils/db/client";
import { Address, BytesHex, Uint } from "~/utils/solidity/primatives";

export class PostIndex {
	constructor(
		public readonly chainId: bigint,
		public readonly feedId: BytesHex<32>,
		public readonly index: Uint<"256">,
		public readonly authorAddress: Address,
		public readonly time_seconds: Uint<"256">,
		public readonly post: Post,
	) {}

	public static async load(network: Config.Network, feedId: BytesHex<32>, index: Uint<"256">) {
		const provider = new JsonRpcProvider(network.providers[0]);
		const indexerContract = PostIndexer.connect(provider, network.contracts.PostIndexer);

		const indexHex = BytesHex(32).parse(toBeHex(index));

		let dbPostIndex = await db.find("PostIndex").byKey([network.contracts.PostIndexer, feedId, indexHex]);

		const postIndex = await indexerContract.get(feedId, index);
		const [author, postId, postStore, time] = postIndex;

		const authorAddress = Address().parse(author);
		const postIdHex = BytesHex(12).parse(toBeHex(postId));
		const storeAddress = Address().parse(postStore);
		const time_seconds = Uint("256").parse(time);

		if (!dbPostIndex) {
			dbPostIndex = {
				feedId,
				authorAddress,
				indexerAddress: network.contracts.PostIndexer,
				indexHex,
				postIdHex,
				storeAddress,
				time_seconds,
			};
			await db.add("PostIndex").values(dbPostIndex).execute();
		}

		let dbPost = await db.find("Post").byKey([storeAddress, postIdHex]);

		if (!dbPost) {
			const storeContract = PostStore.connect(provider, storeAddress);
			dbPost = {
				storeAddress,
				postIdHex,
				content: BytesHex().parse(await storeContract.get(postId)),
			};
			await db.add("Post").values(dbPost).execute();
		}

		return new PostIndex(
			network.chainId,
			feedId,
			index,
			dbPostIndex.authorAddress,
			dbPostIndex.time_seconds,
			new Post(dbPost.postIdHex, dbPost.storeAddress, dbPost.content),
		);
	}
}
