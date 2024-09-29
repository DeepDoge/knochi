import { ExposedRequestMessageData, ExposedResponseMessageData, Routes, TypedChannel } from "@root/service";
import { Signal } from "purify-js";

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

const portToSignalMap = new Map<MessagePort, Signal.State<unknown>>();

export namespace sw {
	export function use<TModuleName extends keyof Routes>(module: TModuleName) {
		type RouteModule = Routes[TModuleName];
		type RouteModuleMembers = {
			[K in keyof RouteModule]: RouteModule[K] extends { (...args: infer Args): infer Returns } ?
				(...args: Args) => Promise<Awaited<Returns>>
			: RouteModule[K] extends TypedChannel<infer Type> ? Signal<Type>
			: () => Promise<RouteModule[K]>;
		};
		return new Proxy(
			{},
			{
				get(_, prop) {
					return (...args: unknown[]): Promise<unknown> =>
						new Promise(async (resolve, reject) => {
							const sw = await swPromise;

							const data: ExposedRequestMessageData = {
								type: "exposed:request",
								module,
								name: String(prop),
								args,
							};

							const channel = new MessageChannel();
							channel.port1.onmessage = (event) => {
								const parsed = ExposedResponseMessageData.safeParse(event.data);
								if (!parsed.success) {
									reject(new Error("Invalid response from service worker"));
								} else if (parsed.data.type === "success") {
									const response = parsed.data.response;
									if (response.type === "data") {
										resolve(response.data);
									} else if (response.type === "channel") {
										const listenPort = event.ports[0];
										if (!listenPort) {
											return reject(
												new Error(
													"Channel request requires a channel port transfered with the message",
												),
											);
										}

										const cache = portToSignalMap.get(listenPort);
										if (cache) {
											return resolve(cache);
										}

										const signal = new Signal.State<unknown>(null);
										portToSignalMap.set(listenPort, signal);
										listenPort.onmessage = (event) => {
											signal.val = event.data;
										};
										resolve(signal);
									}
								} else if (parsed.data.type === "error") {
									reject(new Error(parsed.data.error));
								}
							};

							sw.postMessage(data, [channel.port2]);
						});
				},
			},
		) as never as RouteModuleMembers;
	}
}
