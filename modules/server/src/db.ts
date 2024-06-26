import { DB } from "@modules/database";
import { getAddress, isAddress } from "ethers";
import { bigint, object, string } from "zod";

const Address = string().refine(isAddress, "Invalid EVM address").transform(getAddress);
type Address = `0x${any}${any}`;

export const db = DB.create("eternis")
	.version(1, {
		PostIndex: DB.ModelBuilder()
			.parser(
				object({
					indexerContractAddress: Address,
					index: bigint(),
					id: bigint(),
					senderAddress: Address, // Most likely to be a Proxy Contract address
					originAddress: Address,
					timestamp: bigint(),
				}).strict().parse,
			)
			.key({ keyPath: ["indexerContractAddress", "index"] })
			.index({ field: ["senderAddress", "id"], options: { unique: true } }) // Sender decides the post ID
			.index({ field: "originAddress", options: {} })
			.build(),
		Post: DB.ModelBuilder()
			.parser(
				object({
					proxyContractAddress: Address,
					id: bigint(),
					content: string(),
				}).strict().parse,
			)
			.key({ keyPath: ["proxyContractAddress", "id"] })
			.build(),
	})
	.build();
