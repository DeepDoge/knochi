import { Routes } from "~/routes";
import { ExposedRequestMessageData, ExposedResponseMessageData } from "./types";

export async function registerExposedModules() {
	const imports = import.meta.glob("../routes/**/+expose.ts", { eager: true });
	self.addEventListener("message", async (event: MessageEvent) => {
		const parsed = ExposedRequestMessageData.safeParse(event.data);
		if (!parsed.success) {
			return;
		}
		const { data } = parsed;
		const moduleKey = `../routes${data.module}/+expose.ts` as const;
		const module = imports[moduleKey] as Routes[keyof Routes];
		const member = module[data.name as keyof typeof module] as unknown;

		console.log(`ServiceWorker Call`, {
			name: data.name,
			args: data.args,
		});
		try {
			let result = typeof member === "function" ? await member(...data.args) : member;
			event.ports[0]?.postMessage({ type: "success", result } satisfies ExposedResponseMessageData);
			console.log(`ServiceWorker Call Success`, { name: data.name, result });
		} catch (throwed) {
			console.error(throwed);
			const error = String(throwed);
			event.ports[0]?.postMessage({ type: "error", error } satisfies ExposedResponseMessageData);
			console.error(`ServiceWorker Call Error`, { name: data.name, error });
		}
	});
}
