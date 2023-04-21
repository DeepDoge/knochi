import networksJson from "@/../graph/networks.json"
import graphVersionLabel from "@/../graph/version-label.json"
import type { Address } from "@/utils/address"

export namespace networks {
	export type ChainKey = keyof typeof networksJson

	export type Chain = {
		id: number
		name: string
		symbol: string
		iconHref: string
	}

	export const chains = {
		mumbai: {
			id: 80001,
			name: "Mumbai Testnet",
			symbol: "MATIC",
			iconHref: "",
		},
		sepolia: {
			id: 11155111,
			name: "Sepolia Testnet",
			symbol: "SepoliaETH",
			iconHref: "",
		},
	} satisfies Record<ChainKey, Chain>

	export type Provider = {
		rpc: URL
		blockExplorer: URL | null
	}

	export const providers = {
		mumbai: {
			rpc: new URL("https://matic-mumbai.chainstacklabs.com"),
			blockExplorer: new URL("https://mumbai.polygonscan.com/"),
		},
		sepolia: {
			rpc: new URL("https://sepolia.infura.io/v3/"),
			blockExplorer: new URL("https://sepolia.etherscan.io"),
		},
	} satisfies Record<ChainKey, Provider>

	export type GraphApi = {
		url: URL
	}

	export const graphApis = {
		mumbai: {
			url: new URL(`https://api.studio.thegraph.com/query/45351/dforum-mumbai/${graphVersionLabel.versionLabel}`),
		},
		sepolia: {
			url: new URL(`https://api.studio.thegraph.com/query/45351/dforum-sepolia/${graphVersionLabel.versionLabel}`),
		},
	} satisfies Record<ChainKey, GraphApi>

	type NestedStringToAddress<T extends Record<string, any>> = {
		[K in keyof T]: T[K] extends Record<string, any> ? NestedStringToAddress<T[K]> : T[K] extends string ? Address : T[K]
	}
	export const subgraphs = networksJson as NestedStringToAddress<typeof networksJson>
}
