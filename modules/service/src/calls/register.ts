import * as calls from "./all";
import { RequestMessageData, ResponseMessageData } from "./types";

export function registerCalls() {
	(Object.keys(calls) as (keyof typeof calls)[]).forEach((name) => {
		self.addEventListener("message", async (event: MessageEvent) => {
			const parsed = RequestMessageData.safeParse(event.data);
			if (!parsed.success) {
				return;
			}
			const { data } = parsed;
			if (data.name !== name) return;
			const call = calls[name] as unknown;

			console.log(`ServiceWorker Call`, {
				name,
				args: data.args,
			});
			try {
				let result = typeof call === "function" ? await call(...data.args) : call;
				event.ports[0]?.postMessage({ type: "success", result } satisfies ResponseMessageData);
				console.log(`ServiceWorker Call Success`, { name, result });
			} catch (throwed) {
				console.error(throwed);
				const error = String(throwed);
				event.ports[0]?.postMessage({ type: "error", error } satisfies ResponseMessageData);
				console.error(`ServiceWorker Call Error`, { name, error });
			}
		});
	});
}
