import { ref, Signal } from "@purifyjs/core";
import logoSrc from "~/assets/svgs/chains/bitcoin.svg?url";
import { Address } from "~/utils/solidity/primatives";

export type Config = {
	readonly networks: {
		readonly [K in `${Config.Network.ChainId}`]: Config.Network;
	};
};
export namespace Config {
	export type Network = {
		readonly name: string;
		readonly iconSrc: string;
		readonly chainId: Network.ChainId;
		readonly blockExplorer: string;
		readonly nativeCurrency: {
			readonly symbol: string;
			readonly decimals: number;
		};
		readonly providers: readonly [string, ...string[]];
		readonly contracts: {
			readonly PostIndexer: Address;
			readonly PostStores: {
				readonly Plain: Readonly<Record<string, Address>>;
			};
		};
	};
	export namespace Network {
		export type ChainId = bigint;
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

const configJson = localStorage.getItem("knochi/config");
const configState = ref<Config>(configJson ? (JSON.parse(configJson) as Config) : structuredClone(DEFAULT_CONFIG));
export const currentConfig = configState as Signal<Config>;

export function setConfig(value: Config) {
	localStorage.setItem("knochi/config", JSON.stringify(value));
	configState.val = structuredClone(value);
}
