import { ref } from "@purifyjs/core";
import { bigint, number, object, record, string, tuple } from "zod";
import logoSrc from "~/assets/svgs/chains/bitcoin.svg?url";
import { catchError } from "~/lib/catch";
import { Address } from "~/lib/solidity/primatives";

export type Config = {
	readonly networks: {
		readonly [K in `${Config.Network.ChainId}`]: Config.Network;
	};
};
export function Config() {
	return object({
		networks: record(string(), Config.Network()).readonly(),
	})
		.readonly()
		.transform((config): Config => config);
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
const configBroadcast = new BroadcastChannel(configKey);
const configSchema = Config();

configBroadcast.onmessage = (event) => (config.val = configSchema.parse(event.data));
export const config = ref<Config>(
	catchError(() => parseJson(localStorage.getItem(configKey) ?? ""), [Error]).data ?? structuredClone(DEFAULT_CONFIG),
	(set) => {
		configBroadcast.addEventListener("message", broadcastListener);
		function broadcastListener(event: MessageEvent) {
			const newConfig = configSchema.safeParse(event.data);
			if (!newConfig.success) return;
			if (toJson(newConfig.data) === toJson(config.val)) return;
			set(newConfig.data);
		}
		return () => {
			configBroadcast.removeEventListener("message", broadcastListener);
		};
	},
);
config.follow((config) => {
	localStorage.setItem(configKey, toJson(config));
	configBroadcast.postMessage(config);
}, true);

function parseJson(json: string) {
	return configSchema.parse(
		JSON.parse(json, (_, value) => {
			if (typeof value === "string") {
				const index = value.indexOf(":");
				if (index < 0) return value;
				const type = value.slice(0, index);
				const val = value.slice(index + 1);
				switch (type) {
					case "string":
						return val;
					case "bigint":
						return BigInt(val);
					default:
						return value;
				}
			}
			return value;
		}),
	);
}

function toJson(config: Config): string {
	return JSON.stringify(config, (_, value) => {
		switch (typeof value) {
			case "string":
				return `string:${value}`;
			case "bigint":
				return `bigint:${value}`;
			default:
				return value;
		}
	});
}
