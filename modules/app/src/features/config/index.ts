import { ref } from "purified-js";
import { configUpdateBroadcastChannel } from "~/features/config/broadcastChannels";
import { sw } from "~/sw";

export const config = ref(await sw.use("/config").getConfigs());

configUpdateBroadcastChannel.addEventListener("message", (value) => {
	config.val = value.data;
});
