import { bigint, object, string } from "zod";
import { Feed } from "~/features/post/utils/Feed";
import { Address, Hex } from "~/utils/solidity/primatives";
import { DB } from "./module";

export const db = DB.create("knochi.posts")
	.version(1, {
		FeedGroup: DB.ModelBuilder()
			.parser(
				object({
					groupId: string(),
					name: string(),
				}).parse,
			)
			.key({ keyPath: ["groupId"] })
			.build(),
		Feed: DB.ModelBuilder()
			.parser(
				object({
					indexerAddress: Address(),
					feedId: Feed.Id(),
					length: bigint(),
					groupId: string(),
				}).strict().parse,
			)
			.key({ keyPath: ["indexerAddress", "feedId"] })
			.index({ field: "feedId", options: {} })
			.index({ field: ["feedId", "groupId"], options: { unique: true } })
			.index({ field: "groupId", options: {} })
			.build(),
		PostIndex: DB.ModelBuilder()
			.parser(
				object({
					indexerAddress: Address(),
					feedId: Feed.Id(),
					indexHex: Hex(),
					postIdHex: Hex(),
					storeAddress: Address(),
					authorAddress: Address(),
					time_seconds: bigint(),
				}).strict().parse,
			)
			.key({ keyPath: ["indexerAddress", "feedId", "indexHex"] })
			.index({ field: ["indexerAddress", "feedId", "indexHex"], options: {} })
			.index({ field: ["storeAddress", "postIdHex"], options: { unique: true } })
			.index({ field: "authorAddress", options: {} })
			.build(),
		Post: DB.ModelBuilder()
			.parser(
				object({
					storeAddress: Address(),
					postIdHex: Hex(),
					content: Hex(),
				}).strict().parse,
			)
			.key({ keyPath: ["storeAddress", "postIdHex"] })
			.build(),
	})
	.build();
