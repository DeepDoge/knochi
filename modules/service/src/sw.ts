import { registerExposedModules } from "./exposed/register";

self.addEventListener("install", (event) => {
	console.log("Installed");
});

self.addEventListener("activate", (event) => {
	console.log("Activated");
});

const signalsChannel = new BroadcastChannel("signals");

registerExposedModules();
