import { sw } from "@/sw";
import { configUpdateBroadcastChannel } from "@modules/service/features/config/broadcastChannels";
import { ref } from "purify-js";

export const config = ref(await sw.calls.getConfigs());

configUpdateBroadcastChannel.addEventListener("message", (value) => {
	config.val = value.data;
});
