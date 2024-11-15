import { bigint, object } from "zod";
import { DB } from "~/shared/db";
import { FeedId } from "~/shared/schemas/feed";
import { Address, Hex } from "~/shared/schemas/primatives";

const indexedDbVersionKey = "indexed-db-version:knochi.post";
const version = "1";
if (localStorage.getItem(indexedDbVersionKey) !== version) {
	await DB.IDB.toPromise(indexedDB.deleteDatabase("knochi.post"));
	localStorage.setItem(indexedDbVersionKey, version);
}

export const postDB = DB.create("knochi.post")
	.version(1, {
		PostIndex: DB.ModelBuilder()
			.parser(
				object({
					chainIdHex: Hex(),
					indexerAddress: Address(),
					feedId: FeedId(),
					indexHex: Hex(),
					postIdHex: Hex(),
					storeAddress: Address(),
					authorAddress: Address(),
					time_seconds: bigint(),
				}).strict().parse,
			)
			.key({ keyPath: ["chainIdHex", "indexerAddress", "feedId", "indexHex"] })
			.index({ field: ["chainIdHex", "indexerAddress", "feedId"], options: {} })
			.index({ field: "feedId", options: {} })
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
