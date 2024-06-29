import type { Config as ConfigType } from "@modules/service/config";
import { ref } from "purify-js";

export const config = ref(
	await fetch("/api/config")
		.then((response) => response.json())
		.then((data) => data as ConfigType),
);

const broadcastChannel = new BroadcastChannel("config");
broadcastChannel.addEventListener("message", (value) => {
	config.val = value.data;
});
