import networksJson from "@/../graph/networks.json"
import graphVersionLabel from "@/../graph/version-label.json"
import type { Address } from "@/utils/address"

export namespace networkConfigs {
	type NestedStringToAddress<T extends Record<string, any>> = {
		[K in keyof T]: T[K] extends Record<string, any> ? NestedStringToAddress<T[K]> : T[K] extends string ? Address : T[K]
	}

	const subgraphs = networksJson as NestedStringToAddress<typeof networksJson>

	export type ChainKey = keyof typeof networksJson
	export type ContractName = keyof (typeof networksJson)[keyof typeof networksJson]

	export type ChainCurrencyConfig = { name: string; decimals: number; symbol: string }

	export type ChainConfig = {
		id: number
		name: string
		currency: ChainCurrencyConfig
		iconHref: string
	}

	export type RpcProviderConfig = {
		rpc: URL
		blockExplorer: URL | null
	}

	export type GraphApiConfig = {
		url: URL
	}

	export type SubgraphConfig = {
		address: Address
		startBlock: number
	}

	export type GraphConfig = {
		subgraphs: Partial<Record<ContractName, SubgraphConfig>>
		api: URL
	}

	export const chains = {
		mumbai: {
			id: 80001,
			name: "Mumbai Testnet",
			currency: {
				name: "MATIC",
				symbol: "MATIC",
				decimals: 18,
			},
			iconHref: "",
		} as const,
		sepolia: {
			id: 11155111,
			name: "Sepolia Testnet",
			currency: {
				name: "SepoliaETH",
				symbol: "SepoliaETH",
				decimals: 18,
			},
			iconHref: "",
		} as const,
	} satisfies Record<ChainKey, ChainConfig>

	// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
	export const chainIdToKey = Object.fromEntries(Object.entries(chains).map(([key, chain]) => [chain.id, key])) as Record<number, ChainKey> // UnionToIntersection<{ [K in ChainKey]: { [k in (typeof chains)[K]["id"]]: K } }[ChainKey]>

	export const rpcProviders = {
		mumbai: {
			rpc: new URL("https://matic-mumbai.chainstacklabs.com"),
			blockExplorer: new URL("https://mumbai.polygonscan.com/"),
		} as const,
		sepolia: {
			rpc: new URL("https://sepolia.infura.io/v3/"),
			blockExplorer: new URL("https://sepolia.etherscan.io"),
		} as const,
	} satisfies Record<ChainKey, RpcProviderConfig>

	export const graphs = {
		mumbai: {
			subgraphs: subgraphs.mumbai,
			api: new URL(`https://api.studio.thegraph.com/query/45351/dforum-mumbai/${graphVersionLabel.versionLabel}`),
		} as const,
		sepolia: {
			subgraphs: subgraphs.sepolia,
			api: new URL(`https://api.studio.thegraph.com/query/45351/dforum-sepolia/${graphVersionLabel.versionLabel}`),
		} as const,
	} satisfies Record<ChainKey, GraphConfig>
}
