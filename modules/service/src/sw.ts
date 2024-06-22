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
