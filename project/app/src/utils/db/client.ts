import { object } from "zod";
import { Address, BytesHex, Uint } from "~/utils/solidity/primatives";
import { DB } from "./module";

export const db = DB.create("knochi.posts")
	.version(1, {
		Feed: DB.ModelBuilder()
			.parser(
				object({
					indexerAddress: Address(),
					feedId: BytesHex(32),
					length: Uint("256"),
				}).strict().parse,
			)
			.key({ keyPath: ["indexerAddress", "feedId"] })
			.index({ field: "feedId", options: {} })
			.build(),
		PostIndex: DB.ModelBuilder()
			.parser(
				object({
					indexerAddress: Address(),
					feedId: BytesHex(32),
					indexHex: BytesHex(32),
					postIdHex: BytesHex(12),
					storeAddress: Address(),
					authorAddress: Address(),
					time_seconds: Uint("256"),
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
					postIdHex: BytesHex(12),
					content: BytesHex(),
				}).strict().parse,
			)
			.key({ keyPath: ["storeAddress", "postIdHex"] })
			.build(),
	})
	.build();
