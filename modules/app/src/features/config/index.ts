import { ref } from "purify-js";
import { sw } from "~/sw";

const { getConfig, setConfig, configChannel } = sw.use("/config");

export const config = ref(await getConfig());
