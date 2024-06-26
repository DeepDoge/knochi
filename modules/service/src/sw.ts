declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
	console.log("Installed");
});

self.addEventListener("activate", (event) => {
	console.log("Activated");
});

const signalsChannel = new BroadcastChannel("signals");

self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);

	if (url.pathname.startsWith("/api/")) {
		event.respondWith(
			import(`./api/${url.pathname.slice(5)}.ts`)
				.then(async (module) => {
					const method = event.request.method.toUpperCase();
					const handler = module[method];
					if (typeof handler === "function") {
						return (async () => handler(event.request))().catch((throwed) => {
							if (throwed instanceof Response) {
								return throwed;
							}

							console.error(throwed);
							if (throwed instanceof Error) {
								return new Response(`Internal Server Error: ${throwed.message}`, { status: 500 });
							}
							return new Response("Internal Server Error", { status: 500 });
						});
					} else {
						return new Response("Method Not Allowed", { status: 405 });
					}
				})
				.catch((error) => {
					console.error(error);
					return new Response("Not Found", { status: 404 });
				}),
		);
	} else {
		event.respondWith(fetch(event.request));
	}
});
