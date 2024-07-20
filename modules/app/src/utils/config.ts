import { sw } from "@/sw";
import { ref } from "purify-js";

export const config = ref(await sw.calls.getConfig());

const broadcastChannel = new BroadcastChannel("config");
broadcastChannel.addEventListener("message", (value) => {
	config.val = value.data;
});
