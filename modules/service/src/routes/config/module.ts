import { configUpdateBroadcastChannel } from "@root/app/src/features/config/broadcastChannels";
import { AddressHex } from "@root/app/src/utils/hex";
import { db } from "~/db";

export type Config = {
	readonly networks: readonly [Config.Network, ...Config.Network[]];
};
export namespace Config {
	export type Network = {
		readonly name: string;
		readonly logoSrc?: string | null;
		readonly chainId: bigint;
		readonly blockExplorer: string;
		readonly nativeCurrency: {
			readonly symbol: string;
			readonly decimals: number;
		};
		readonly providers: readonly [string, ...string[]];
		readonly contracts: {
			EternisIndexer: AddressHex;
			readonly EternisProxies: Readonly<Record<string, AddressHex>>;
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
				chainId: 11155111n,
				providers: ["https://sepolia.infura.io/v3/a104675596c145f29f50bf72c27a82f3"],
				nativeCurrency: {
					symbol: "SepoliaETH",
					decimals: 18,
				},
				blockExplorer: "https://sepolia.etherscan.io",
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
