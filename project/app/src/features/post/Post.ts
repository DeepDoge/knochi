import { PostIndexer, PostStore } from "@root/contracts/connect";
import { BytesLike, JsonRpcProvider, toBeHex, toBigInt } from "ethers";
import { postDB } from "~/features/post/database/client";
import { PostContent } from "~/features/post/PostContent";
import { Config } from "~/shared/config";
import { FeedId } from "~/shared/schemas/feed";
import { Address, Hex } from "~/shared/schemas/primatives";

export type PostLoadParams = {
	network: Config.Network;
	indexerAddress: Address;
	feedId: FeedId;
	index: bigint;
};

export class Post {
	public readonly author: Address;
	public readonly createdAt: Date;
	public readonly content: PostContent;

	public readonly loadedWith: PostLoadParams;

	private constructor(
		init: { author: Address; contentBytes: BytesLike; time_ms: bigint },
		loadedWith: PostLoadParams,
	) {
		this.loadedWith = loadedWith;
		this.author = init.author;
		this.content = PostContent.fromBytes(init.contentBytes);
		this.createdAt = new Date(Number(init.time_ms));
	}

	public toSearchParam() {
		const {
			feedId,
			index,
			indexerAddress,
			network: { chainId },
		} = this.loadedWith;

		return `${chainId.toString(16)}-${indexerAddress.slice(2)}-${feedId.slice(2)}-${index.toString(16)}` as const;
	}

	public static async loadWithSearchParam(value: string, config: Config) {
		const [
			chainIdHex0xOmitted,
			indexerAddressHex0xOmitted,
			feedIdHex0xOmitted,
			indexHex0xOmmited,
		] = value.split("-");
		if (!chainIdHex0xOmitted) return null;
		if (!indexerAddressHex0xOmitted) return null;
		if (!indexHex0xOmmited) return null;
		if (!feedIdHex0xOmitted) return null;

		const chainId = Hex().transform(BigInt).safeParse(`0x${chainIdHex0xOmitted}`);
		if (!chainId.success) return null;
		const indexerAddress = Address().safeParse(`0x${indexerAddressHex0xOmitted}`);
		if (!indexerAddress.success) return null;
		const index = Hex().transform(BigInt).safeParse(`0x${indexHex0xOmmited}`);
		if (!index.success) return null;
		const feedId = FeedId().safeParse(`0x${feedIdHex0xOmitted}`);
		if (!feedId.success) return null;

		const network = config.networks[`${chainId.data}`];
		if (!network) return null;

		return await this.load({
			network,
			indexerAddress: indexerAddress.data,
			feedId: feedId.data,
			index: index.data,
		});
	}

	public static async load(params: PostLoadParams) {
		const { network, feedId, index } = params;
		const chainIdHex = Hex().parse(toBeHex(network.chainId));
		const provider = new JsonRpcProvider(network.providers[0]);

		const indexHex = Hex().parse(toBeHex(index));

		let dbPostIndex = await postDB
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
			await postDB.add("PostIndex").values(dbPostIndex).execute();
		}

		let dbPost = await postDB
			.find("Post")
			.byKey([dbPostIndex.storeAddress, dbPostIndex.postIdHex]);

		if (!dbPost) {
			const storeContract = PostStore.connect(provider, dbPostIndex.storeAddress);
			dbPost = {
				storeAddress: dbPostIndex.storeAddress,
				postIdHex: dbPostIndex.postIdHex,
				content: await storeContract.get(toBigInt(dbPostIndex.postIdHex)),
			};
			await postDB.add("Post").values(dbPost).execute();
		}

		const post = new Post(
			{
				author: dbPostIndex.authorAddress,
				contentBytes: dbPost.content,
				time_ms: dbPostIndex.time_seconds, // TODO: Rename this, its ms
			},
			params,
		);

		return post;
	}
}
