import { Routes } from "~/routes";
import { TypedChannel } from "~/utils/channel";
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
		const value: unknown = data.name in module ? (module[data.name as keyof typeof module] ?? null) : null;

		console.log(`ServiceWorker Call`, {
			name: data.name,
			args: data.args,
		});
		try {
			let response: (ExposedResponseMessageData & { type: "success" })["response"];
			const transferable: Transferable[] = [];
			if (typeof value === "function") {
				const returns = value(...data.args);
				if (returns instanceof Promise) {
					response = { type: "data", data: await returns };
				} else {
					response = { type: "data", data: returns };
				}
			} else if (value instanceof TypedChannel) {
				response = { type: "channel" };
				transferable.push(value.listenPort);
			} else {
				response = { type: "data", data: value };
			}

			event.ports[0]?.postMessage({ type: "success", response } satisfies ExposedResponseMessageData);
			console.log(`ServiceWorker Call Success`, { name: data.name, response });
		} catch (throwed) {
			console.error(throwed);
			const error = String(throwed);
			event.ports[0]?.postMessage({ type: "error", error } satisfies ExposedResponseMessageData);
			console.error(`ServiceWorker Call Error`, { name: data.name, error });
		}
	});
}
