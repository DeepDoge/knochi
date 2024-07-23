import { configUpdateBroadcastChannel } from "@root/service/features/config/broadcastChannels";
import { ref } from "purify-js";
import { sw } from "~/sw";

export const config = ref(await sw.calls.getConfigs());

configUpdateBroadcastChannel.addEventListener("message", (value) => {
	config.val = value.data;
});
