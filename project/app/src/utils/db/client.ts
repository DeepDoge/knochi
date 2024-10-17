import { bigint, object } from "zod";
import { Address, Hex } from "~/utils/solidity/primatives";
import { DB } from "./module";

export const db = DB.create("knochi.posts")
	.version(1, {
		Feed: DB.ModelBuilder()
			.parser(
				object({
					indexerAddress: Address(),
					feedId: Hex(),
					length: bigint(),
				}).strict().parse,
			)
			.key({ keyPath: ["indexerAddress", "feedId"] })
			.index({ field: "feedId", options: {} })
			.build(),
		PostIndex: DB.ModelBuilder()
			.parser(
				object({
					indexerAddress: Address(),
					feedId: Hex(),
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
