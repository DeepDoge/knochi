import { DB } from "@modules/database";
import { getAddress, isAddress, isHexString } from "ethers";
import { bigint, object, string } from "zod";

const Address = string().refine(isAddress, "Invalid EVM address").transform(getAddress);
type Address = (typeof Address)["_output"];

const Bytes32 = string().refine(
	(value): value is typeof isHexString extends (value: any, ...args: any[]) => value is infer U ? U : never =>
		isHexString(value, 32),
);
type Bytes32 = (typeof Bytes32)["_output"];

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
