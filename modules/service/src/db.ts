import { DB } from "@modules/database";
import { bigint, object, string } from "zod";
import { Address, Bytes32 } from "./types";

export const db = DB.create("eternis")
	.version(1, {
		Feed: DB.ModelBuilder()
			.parser(
				object({
					indexerContractAddress: Address,
					feedId: Bytes32,
					length: bigint(),
				}).strict().parse,
			)
			.key({ keyPath: ["indexerContractAddress", "feedId"] })
			.index({ field: "feedId", options: {} })
			.build(),
		PostIndex: DB.ModelBuilder()
			.parser(
				object({
					indexerContractAddress: Address,
					feedId: Bytes32,
					index: bigint(),
					postId: bigint(),
					/** Most likely a `proxyContractAddress` */
					senderAddress: Address,
					originAddress: Address,
					timestamp: bigint(),
				}).strict().parse,
			)
			.key({ keyPath: ["indexerContractAddress", "feedId", "index"] })
			.index({ field: ["indexerContractAddress", "feedId", "index"], options: {} })
			.index({ field: ["senderAddress", "postId"], options: { unique: true } }) // Sender decides the post ID
			.index({ field: "originAddress", options: {} })
			.build(),
		Post: DB.ModelBuilder()
			.parser(
				object({
					proxyContractAddress: Address,
					postId: bigint(),
					content: string(),
				}).strict().parse,
			)
			.key({ keyPath: ["proxyContractAddress", "postId"] })
			.build(),
	})
	.build();
