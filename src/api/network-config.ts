import type networksJson from "@/../graph/networks.json"
import graphVersionLabel from "@/../graph/version-label.json"
import { EthereumChainSvg } from "@/assets/svgs/chains/ethereum"
import { PolygonChainSvg } from "@/assets/svgs/chains/polygon"
import { Address } from "@/utils/address"

// TODO: all of these should be able to be changed by the user, so make something like config page, dont bother with the reactivity just reload on save

export namespace networkConfigs {
	export const chains = {
		mumbai: {
			id: 80001n,
			name: "Mumbai Testnet",
			currency: {
				name: "MATIC",
				symbol: "MATIC",
				decimals: 18,
			},
			iconSvg: PolygonChainSvg,
			colorBackgroundHsl: "257,64%,56%",
			colorTextHsl: "0,0%,100%",
		} as const,
		sepolia: {
			id: 11155111n,
			name: "Sepolia Testnet",
			currency: {
				name: "SepoliaETH",
				symbol: "SepoliaETH",
				decimals: 18,
			},
			iconSvg: EthereumChainSvg,
			colorBackgroundHsl: "199,49%,59%",
			colorTextHsl: "0,0%,100%",
		} as const,
	} as const satisfies Record<ChainKey, ChainConfig>

	export const rpcProviders = {
		mumbai: {
			rpc: new URL("https://matic-mumbai.chainstacklabs.com"),
			blockExplorer: new URL("https://mumbai.polygonscan.com/"),
		} as const,
		sepolia: {
			rpc: new URL("https://sepolia.infura.io/v3/"),
			blockExplorer: new URL("https://sepolia.etherscan.io"),
		} as const,
	} as const satisfies Record<ChainKey, RpcProviderConfig>

	export const contracts = {
		mumbai: {
			EternisPostDB: Address.from("0xA4A0Db3C5739C5E8cb63Fe86c6d5103558D8B19d"),
		} as const,
		sepolia: {
			EternisPostDB: Address.from("0xcE1EEfdf8A9F638D4134F240ED134ECBedac7730"),
		} as const,
	} as const satisfies Record<ChainKey, ContractsConfig>

	export const graphs = {
		mumbai: {
			api: new URL(`https://api.studio.thegraph.com/query/45351/dforum-mumbai/${graphVersionLabel.versionLabel}`),
		} as const,
		sepolia: {
			api: new URL(`https://api.studio.thegraph.com/query/45351/dforum-sepolia/${graphVersionLabel.versionLabel}`),
		} as const,
	} as const satisfies Record<ChainKey, GraphConfig>

	export const chainIdToKeyMap = new Map<bigint, ChainKey>(Object.entries(chains).map(([key, chain]) => [chain.id, key as ChainKey]))

	export type ChainKey = keyof typeof networksJson
	export type ContractName = keyof (typeof networksJson)[keyof typeof networksJson]

	export type ChainCurrencyConfig = { name: string; decimals: number; symbol: string }

	export type ColorHsl = `${number},${number}%,${number}%`

	export type ChainConfig = {
		id: bigint
		name: string
		currency: ChainCurrencyConfig
		iconSvg: () => SVGElement
		colorTextHsl: ColorHsl
		colorBackgroundHsl: ColorHsl
	}

	export type RpcProviderConfig = {
		rpc: URL
		blockExplorer: URL | null
	}

	export type GraphApiConfig = {
		url: URL
	}

	export type GraphConfig = {
		api: URL
	}

	export type ContractsConfig = {
		EternisPostDB: Address
	}
}
