import { bigint, literal, number, object, string, union } from "zod";
import { DB } from "~/shared/db";
import { FeedId } from "~/shared/schemas/feed";
import { Address, Hex } from "~/shared/schemas/primatives";

const indexedDbVersionKey = "indexed-db-version:knochi.feed";
const version = "1";
if (localStorage.getItem(indexedDbVersionKey) !== version) {
	await DB.IDB.toPromise(indexedDB.deleteDatabase("knochi.feed"));
	localStorage.setItem(indexedDbVersionKey, version);
}

export const feedDB = DB.create("knochi.feed")
	.version(1, {
		FeedGroup: DB.ModelBuilder()
			.parser(
				object({
					groupId: string(),
					name: string(),
					index: number(),
				}).parse,
			)
			.key({ keyPath: ["groupId"] })
			.index({ field: "index", options: {} })
			.build(),
		FeedGroupItem: DB.ModelBuilder()
			.parser(
				object({
					groupId: string(),
					feedId: FeedId(),
					style: union([
						object({
							type: literal("profile"),
							address: Address(),
							label: string(),
						}),
						object({
							type: literal("feed"),
							label: string(),
						}),
					]),
				}).parse,
			)
			.key({ keyPath: ["groupId", "feedId"] })
			.index({ field: "groupId", options: {} })
			.build(),
		Feed: DB.ModelBuilder()
			.parser(
				object({
					chainIdHex: Hex(),
					indexerAddress: Address(),
					feedId: FeedId(),
					length: bigint(),
				}).strict().parse,
			)
			.key({ keyPath: ["chainIdHex", "indexerAddress", "feedId"] })
			.index({ field: "feedId", options: {} })
			.build(),
	})
	.build();
