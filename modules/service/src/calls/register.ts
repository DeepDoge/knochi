import { Routes } from "~/routes";
import { RequestMessageData, ResponseMessageData } from "./types";

export function registerCalls() {
	self.addEventListener("message", async (event: MessageEvent) => {
		const parsed = RequestMessageData.safeParse(event.data);
		if (!parsed.success) {
			return;
		}
		const { data } = parsed;
		const module = (await import(data.module)) as Routes[keyof Routes];
		const member = module[data.name as keyof typeof module] as unknown;

		console.log(`ServiceWorker Call`, {
			name: data.name,
			args: data.args,
		});
		try {
			let result = typeof member === "function" ? await member(...data.args) : member;
			event.ports[0]?.postMessage({ type: "success", result } satisfies ResponseMessageData);
			console.log(`ServiceWorker Call Success`, { name: data.name, result });
		} catch (throwed) {
			console.error(throwed);
			const error = String(throwed);
			event.ports[0]?.postMessage({ type: "error", error } satisfies ResponseMessageData);
			console.error(`ServiceWorker Call Error`, { name: data.name, error });
		}
	});
}
