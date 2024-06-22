import { object, string } from "zod";
import { DB } from "./db";

export const hello = "hello";

const db = DB.create("test")
	.version(
		1,
		{
			User: DB.ModelBuilder()
				.parser(object({ id: string(), name: string() }).strict().parse)
				.key({ keyPath: "id" })
				.index({ field: "name", options: { unique: true } })
				.build(),
		},
		async (tx) => {
			tx.objectStore("User").add({ id: "123", name: "hello" });
		},
	)
	.version(
		2,
		{
			User: DB.ModelBuilder()
				.parser(object({ id: string() }).strict().parse)
				.key({ keyPath: "id" })
				.build(),
		},
		async (tx) => {
			const iter = DB.IDB.toIterPromise(tx.objectStore("User").openCursor());
			for await (const cursor of iter) {
				delete cursor.value.name;
				cursor.update(cursor.value);
			}
		},
	)
	.version(
		3,
		{
			User: DB.ModelBuilder()
				.parser(object({ id: string(), name: string() }).strict().parse)
				.key({ keyPath: "id" })
				.index({ field: "name", options: { unique: true } })
				.build(),
		},
		async (tx) => {
			const iter = DB.IDB.toIterPromise(tx.objectStore("User").openCursor());
			for await (const cursor of iter) {
				cursor.update({ ...cursor.value, name: cursor.value.id });
			}
		},
	)
	.build();
