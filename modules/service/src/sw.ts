import { registerExposedModules } from "./exposed/register";

declare const self: ServiceWorkerGlobalScope;

const VERSION = "v1";
const URLS_TO_CACHE = ["/", "/index.html", "/app.js", "/manifest.json"];

async function cacheAll() {
	try {
		const cache = await caches.open(VERSION);
		await cache.addAll(URLS_TO_CACHE);
	} catch (error) {
		console.error("Caching failed:", error);
	}
}

self.addEventListener("install", (event) => {
	event.waitUntil(cacheAll());
	if (import.meta.env.DEV) {
		self.skipWaiting();
	}
	console.log("Installed");
});

self.addEventListener("activate", (event) => {
	self.clients.claim();
	console.log("Activated");
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		(async () => {
			try {
				if (import.meta.env.DEV) {
					return await fetch(event.request);
				}

				const cache = await caches.match(event.request);
				if (cache) {
					return cache;
				}
				return await fetch(event.request);
			} catch (error) {
				console.error("Fetch failed:", error);
				return new Response("Network error occurred", { status: 408 });
			}
		})(),
	);
});

registerExposedModules();
