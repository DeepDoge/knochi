import { ref } from "@purifyjs/core";
import { bigint, number, object, record, string, tuple } from "zod";
import logoSrc from "~/assets/svgs/chains/bitcoin.svg?url";
import { Address } from "~/utils/solidity/primatives";

export type Config = {
	readonly networks: {
		readonly [K in `${Config.Network.ChainId}`]: Config.Network;
	};
};
export function Config() {
	return object({
		networks: record(string(), Config.Network()).readonly(),
	}).readonly();
}
export namespace Config {
	export type Network = ReturnType<typeof Network>["_output"];
	export function Network() {
		return object({
			name: string(),
			iconSrc: string().url(),
			chainId: Network.ChainId(),
			blockExplorer: string().url(),
			nativeCurrency: object({
				symbol: string(),
				decimals: number(),
			}).readonly(),
			providers: tuple([string().url()]).rest(string().url()).readonly(),
			contracts: object({
				PostIndexer: Address(),
				PostStores: object({
					Plain: record(string(), Address()).readonly(),
				}).readonly(),
			}).readonly(),
		}).readonly();
	}
	export namespace Network {
		export type ChainId = ReturnType<typeof ChainId>["_output"];
		export function ChainId() {
			return bigint();
		}
	}
}

const DEFAULT_CONFIG = {
	networks: {
		"1337": {
			name: "Local Dev",
			iconSrc: logoSrc,
			chainId: 1337n,
			providers: ["http://localhost:7545"],
			nativeCurrency: {
				symbol: "ETH",
				decimals: 18,
			},
			blockExplorer: "",
			contracts: {
				PostIndexer: "0x2a41bb6D55813D84bfabB0f93f08A8788B439646",
				PostStores: {
					Plain: {
						SSTORE: "0x2B338e9dC4306c34290980Cf1Fb8880A3BDBC28B",
					},
				},
			},
		},
	},
} as const satisfies Config;

const configKey = "knochi/config";

const storedConfigJson = localStorage.getItem(configKey);
const configBroadcast = new BroadcastChannel(configKey);
configBroadcast.onmessage = (event) => {
	configState.val = event.data;
};

const configState = ref<Config>(
	storedConfigJson ? Config().parse(JSON.parse(storedConfigJson)) : structuredClone(DEFAULT_CONFIG),
);
export const currentConfig = configState.derive((value) => value);

export function setConfig(value: Config) {
	configState.val = structuredClone(value);
	localStorage.setItem(configKey, JSON.stringify(value));
	configBroadcast.postMessage(value);
}
