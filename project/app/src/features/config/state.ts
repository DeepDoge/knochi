import { ref, Signal } from "purify-js";
import { db } from "~/utils/db/client";
import { AddressHex } from "~/utils/hex";

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
			KnochiIndexer: AddressHex;
			readonly KnochiSenders: Readonly<Record<string, AddressHex>>;
		};
	};
}

const DEFAULT_CONFIG: Config = {
	networks: [
		{
			name: "Local Dev",
			chainId: 1337n,
			providers: ["http://localhost:7545"],
			nativeCurrency: {
				symbol: "ETH",
				decimals: 18,
			},
			blockExplorer: "",
			contracts: {
				KnochiIndexer: "0x2a41bb6D55813D84bfabB0f93f08A8788B439646",
				KnochiSenders: {
					SSTORE: "0x2B338e9dC4306c34290980Cf1Fb8880A3BDBC28B",
				},
			},
		},
		{
			name: "Local Dev 2",
			chainId: 1337n,
			providers: ["http://localhost:7546"],
			nativeCurrency: {
				symbol: "ETH",
				decimals: 18,
			},
			blockExplorer: "",
			contracts: {
				KnochiIndexer: "0x2a41bb6D55813D84bfabB0f93f08A8788B439646",
				KnochiSenders: {
					SSTORE: "0x2B338e9dC4306c34290980Cf1Fb8880A3BDBC28B",
				},
			},
		},
	],
};

const configState = ref<Promise<Config>>(
	db
		.find("KV")
		.byKey("config")
		.then((config) => (config?.value as Config | undefined) ?? structuredClone(DEFAULT_CONFIG)),
);
export const currentConfig = configState as Signal<Promise<Config>>;

export async function setConfig(value: Config) {
	await (configState.val = db
		.set("KV")
		.byKey("config", { key: "config", value })
		.execute()
		.then(() => structuredClone(value)));
}
