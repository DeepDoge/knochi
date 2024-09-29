import { AddressHex, Bytes32Hex } from "@root/app/src/utils/hex";
import { bigint, object, string, unknown } from "zod";
import { DB } from "~/utils/db";
export const db = DB.create("knochi.posts")
	.version(1, {
		KV: DB.ModelBuilder()
			.parser(
				object({
					key: string(),
					value: unknown(),
				}).strict().parse,
			)
			.key({ keyPath: "key" })
			.build(),
		Feed: DB.ModelBuilder()
			.parser(
				object({
					indexerContractAddress: AddressHex,
					feedId: Bytes32Hex,
					length: bigint(),
				}).strict().parse,
			)
			.key({ keyPath: ["indexerContractAddress", "feedId"] })
			.index({ field: "feedId", options: {} })
			.build(),
		PostIndex: DB.ModelBuilder()
			.parser(
				object({
					indexerContractAddress: AddressHex,
					feedId: Bytes32Hex,
					indexHex: string(),
					postIdHex: string(),
					/** Most likely a `proxyContractAddress` */
					senderAddress: AddressHex,
					originAddress: AddressHex,
					timestamp: bigint(),
				}).strict().parse,
			)
			.key({ keyPath: ["indexerContractAddress", "feedId", "indexHex"] })
			.index({ field: ["indexerContractAddress", "feedId", "indexHex"], options: {} })
			.index({ field: ["senderAddress", "postIdHex"], options: { unique: true } }) // Sender decides the post ID
			.index({ field: "originAddress", options: {} })
			.build(),
		Post: DB.ModelBuilder()
			.parser(
				object({
					proxyContractAddress: AddressHex,
					postIdHex: string(),
					content: string(),
				}).strict().parse,
			)
			.key({ keyPath: ["proxyContractAddress", "postIdHex"] })
			.build(),
	})
	.build();
