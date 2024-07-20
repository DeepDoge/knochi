import { db } from "@/db";
import { Address } from "@/types";
import { configUpdateBroadcastChannel } from "./broadcastChannels";

export type Config = {
	readonly networks: readonly [Config.Network, ...Config.Network[]];
};
export namespace Config {
	export type Network = {
		readonly name: string;
		readonly logoSrc?: string | null;
		readonly chainId: string;
		readonly providers: readonly [string, ...string[]];
		readonly contracts: {
			EternisIndexer: Address;
			readonly EternisProxies: Readonly<Record<string, Address>>;
		};
	};

	export async function set(value: Config) {
		await (currentConfig = db
			.set("KV")
			.byKey("config", { key: "config", value })
			.execute()
			.then(() => structuredClone(value)));
		configUpdateBroadcastChannel.postMessage(value);
	}

	export async function get() {
		return await currentConfig;
	}

	const DEFAULT_CONFIG: Config = {
		networks: [
			{
				name: "Sepolia",
				chainId: "11155111",
				providers: ["https://sepolia.infura.io/v3/a104675596c145f29f50bf72c27a82f3"],
				contracts: {
					EternisIndexer: "0xD9506b33E141FFBf2A2A9F48B59dE7D1C6FfC795",
					EternisProxies: {
						SSTORE: "0x4706f3d39e0634e9fb73c4a9a7c71cce22f7ba2f",
					},
				},
			},
		],
	};

	let currentConfig: Promise<Config> = db
		.find("KV")
		.byKey("config")
		.then((config) => (config?.value as Config | undefined) ?? structuredClone(DEFAULT_CONFIG));
}
