import { PostIndexer, PostStore } from "@root/contracts/connect";
import { BytesLike, JsonRpcProvider } from "ethers";
import { postDb } from "~/features/post/database/client";
import { PostContent } from "~/features/post/lib/PostContent";
import { Config } from "~/lib/config";
import { Address, Hex } from "~/lib/solidity/primatives";

export class Post {
	public readonly author: Address;
	public readonly createdAt: Date;
	public readonly content: PostContent;

	constructor(init: Post.Init) {
		this.author = init.author;
		this.content = PostContent.fromBytes(init.contentBytes);
		this.createdAt = new Date(Number(init.time_seconds * 1000n));
	}

	public static async load(params: Post.LoadParams) {
		const { network, feedId, index } = params;

		const provider = new JsonRpcProvider(network.providers[0]);
		const indexerContract = PostIndexer.connect(provider, network.contracts.PostIndexer);

		const indexHex = Hex.from(index);

		let dbPostIndex = await postDb.find("PostIndex").byKey([network.contracts.PostIndexer, feedId, indexHex]);

		const postIndex = await indexerContract.get(feedId, index);
		const [author, postId, postStore, time_seconds] = postIndex;

		const postIdHex = Hex.from(postId);

		if (!dbPostIndex) {
			dbPostIndex = {
				feedId,
				authorAddress: author,
				indexerAddress: network.contracts.PostIndexer,
				indexHex,
				postIdHex,
				storeAddress: postStore,
				time_seconds,
			};
			await postDb.add("PostIndex").values(dbPostIndex).execute();
		}

		let dbPost = await postDb.find("Post").byKey([postStore, postIdHex]);

		if (!dbPost) {
			const provider = new JsonRpcProvider(network.providers[0]);
			const storeContract = PostStore.connect(provider, postStore);
			dbPost = {
				storeAddress: postStore,
				postIdHex,
				content: await storeContract.get(postId),
			};
			await postDb.add("Post").values(dbPost).execute();
		}

		return new Post({ author, contentBytes: dbPost.content, time_seconds });
	}
}
export namespace Post {
	export type Init = {
		author: Address;
		contentBytes: BytesLike;
		time_seconds: bigint;
	};
	export type LoadParams = {
		network: Config.Network;
		feedId: Hex;
		index: bigint;
	};
}
