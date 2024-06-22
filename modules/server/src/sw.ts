import { object, string } from "zod";
import { DB } from "./db";
import { hello } from "./hello";

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
	console.log("Installed");
});

self.addEventListener("activate", (event) => {
	console.log("Activated");
});

self.addEventListener("fetch", (event) => {
	event.respondWith(fetch(event.request));
});

console.log(hello);

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

db.add("User")
	.values({
		id: Math.random().toString(36).slice(2),
		name: Math.random().toString(36).slice(2),
	})
	.execute();
