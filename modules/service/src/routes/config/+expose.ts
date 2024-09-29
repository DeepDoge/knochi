import { AddressHex } from "@root/app/src/utils/hex";
import { db } from "~/db";
import { TypedChannel } from "~/exports";

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
			readonly KnochiProxies: Readonly<Record<string, AddressHex>>;
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
				KnochiIndexer: "0xd296A483c1252308d419E66d6da5a814dcF06276",
				KnochiProxies: {
					SSTORE: "0x5d38d0AD2CB1a0f876056Fa4C18D5d66Aa8598db",
				},
			},
		},
	],
};

let currentConfig: Promise<Config> = db
	.find("KV")
	.byKey("config")
	.then((config) => (config?.value as Config | undefined) ?? structuredClone(DEFAULT_CONFIG));

export let foo = 123;

export const configChannel = new TypedChannel<Config>();

export async function setConfig(value: Config) {
	await (currentConfig = db
		.set("KV")
		.byKey("config", { key: "config", value })
		.execute()
		.then(() => structuredClone(value)));
	configChannel.post(value);
}

export async function getConfig() {
	return await currentConfig;
}
