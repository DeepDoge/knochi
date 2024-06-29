import { bigint, object, record, string } from "zod";
import { db } from "./db";
import { Address } from "./types";

export type Config = (typeof Config)["_output"];
export const Config = object({
	networks: object({
		name: string(),
		logoSrc: string().nullable().optional(),
		chainId: bigint(),
		providers: string().url().array().min(1),
		contracts: object({
			EternisIndexer: Address,
			EternisProxies: record(string(), Address),
		}),
	})
		.array()
		.min(1),
});

const DEFAULT_CONFIG: Config = {
	networks: [
		{
			name: "Sepolia",
			chainId: 11155111n,
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

let config = db
	.find("KV")
	.byKey("config")
	.then((config) => config ?? structuredClone(DEFAULT_CONFIG));

async function setConfig(value: Config) {
	await (config = db.set("KV", {
		key: "config",
		value: value,
	})).then(() => structuredClone(value));
}

async function getConfig() {
	return await config;
}
