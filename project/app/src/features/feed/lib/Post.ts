import { PostIndexer, PostStore } from "@root/contracts/connect";
import { BytesLike, JsonRpcProvider, toBeHex, toBigInt } from "ethers";
import { postDb } from "~/features/feed/database/client";
import { Feed } from "~/features/feed/lib/Feed";
import { PostContent } from "~/features/feed/lib/PostContent";
import { Config } from "~/shared/config";
import { Address, Hex } from "~/shared/solidity/primatives";

export namespace Post {
	export type Init = LoadParams & {
		author: Address;
		contentBytes: BytesLike;
		time_ms: bigint;
	};
	export type LoadParams = {
		network: Config.Network;
		indexerAddress: Address;
		feedId: Feed.Id;
		index: bigint;
	};
}

export class Post {
	public readonly author: Address;
	public readonly createdAt: Date;
	public readonly content: PostContent;

	public readonly network: Config.Network;
	public readonly indexerAddress: Address;
	public readonly feedId: Feed.Id;
	public readonly index: bigint;

	constructor(init: Post.Init) {
		this.author = init.author;
		this.content = PostContent.fromBytes(init.contentBytes);
		this.createdAt = new Date(Number(init.time_ms));

		this.network = init.network;
		this.indexerAddress = init.indexerAddress;
		this.feedId = init.feedId;
		this.index = init.index;
	}

	public static async load(params: Post.LoadParams) {
		const { network, feedId, index } = params;
		const chainIdHex = Hex().parse(toBeHex(network.chainId));
		const provider = new JsonRpcProvider(network.providers[0]);

		const indexHex = Hex().parse(toBeHex(index));

		let dbPostIndex = await postDb
			.find("PostIndex")
			.byKey([chainIdHex, params.indexerAddress, feedId, indexHex]);

		if (!dbPostIndex) {
			const indexerContract = PostIndexer.connect(provider, params.indexerAddress);
			const postIndex = await indexerContract.get(feedId, index);
			const [author, postId, postStore, time_seconds] = postIndex;
			const postIdHex = Hex().parse(toBeHex(postId));
			dbPostIndex = {
				feedId,
				authorAddress: author,
				chainIdHex,
				indexerAddress: params.indexerAddress,
				indexHex,
				postIdHex,
				storeAddress: postStore,
				time_seconds,
			};
			await postDb.add("PostIndex").values(dbPostIndex).execute();
		}

		let dbPost = await postDb
			.find("Post")
			.byKey([dbPostIndex.storeAddress, dbPostIndex.postIdHex]);

		if (!dbPost) {
			const storeContract = PostStore.connect(provider, dbPostIndex.storeAddress);
			dbPost = {
				storeAddress: dbPostIndex.storeAddress,
				postIdHex: dbPostIndex.postIdHex,
				content: await storeContract.get(toBigInt(dbPostIndex.postIdHex)),
			};
			await postDb.add("Post").values(dbPost).execute();
		}

		return new Post({
			...params,
			author: dbPostIndex.authorAddress,
			contentBytes: dbPost.content,
			time_ms: dbPostIndex.time_seconds, // TODO: Rename this, its ms
		});
	}
}
