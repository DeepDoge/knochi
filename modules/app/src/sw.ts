import { Calls } from "@root/service";

await navigator.serviceWorker.getRegistrations().then((registrations) => {
	for (let registration of registrations) {
		registration.unregister();
	}
});

await navigator.serviceWorker.register("/sw.js").then(
	(registration) => console.log("ServiceWorker registration successful"),
	(err) => console.log("ServiceWorker registration failed: ", err),
);

const swPromise = new Promise<ServiceWorker>((resolve, reject) =>
	navigator.serviceWorker.ready.then((registration) => {
		if (registration.active) {
			console.log("ServiceWorker is active");
			resolve(registration.active);
		} else {
			reject(new Error("ServiceWorker registration is not active"));
		}
	}),
);

export namespace sw {
	type calls = {
		[K in keyof Calls.Types]: Calls.Types[K] extends { (...args: infer Args): infer Returns } ?
			(...args: Args) => Promise<Awaited<Returns>>
		:	() => Promise<Calls.Types[K]>;
	};
	export const calls = new Proxy(
		{},
		{
			get(_, prop) {
				return (...args: unknown[]): Promise<unknown> =>
					new Promise(async (resolve, reject) => {
						const sw = await swPromise;

						const data: Calls.RequestMessageData = {
							type: "call:request",
							name: String(prop),
							args,
						};

						const channel = new MessageChannel();
						channel.port1.onmessage = (event) => {
							const parsed = Calls.ResponseMessageData.safeParse(event.data);
							if (!parsed.success) {
								reject(new Error("Invalid response from service worker"));
							} else if (parsed.data.type === "success") {
								resolve(parsed.data.result);
							} else if (parsed.data.type === "error") {
								reject(new Error(parsed.data.error));
							}
						};

						sw.postMessage(data, [channel.port2]);
					});
			},
		},
	) as never as calls;
}
