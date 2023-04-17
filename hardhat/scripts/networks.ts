import { JsonRpcProvider } from "@ethersproject/providers"
import { ethers } from "hardhat"

export namespace NetworkInfo {
	export type Chain = {
		id: number
		name: string
		iconHref: string
		explorerUrl: string
	}

	export type Provider = {
		chain: Chain
		url: string
	}

	export const chains = {
		mumbai: {
			name: "Mumbai Testnet",
			id: 80001,
			iconHref: "",
			explorerUrl: "https://mumbai.polygonscan.com/",
		},
	} satisfies Record<string, Chain>

	export const providers = {
		mumbai: {
			chain: chains.mumbai,
			url: "https://matic-mumbai.chainstacklabs.com",
		},
	} satisfies Record<string, Provider>
}

export const networks = Object.fromEntries(
	Object.entries(NetworkInfo.providers).map(([key, value]) => [
		key,
		() =>
			new ethers.providers.JsonRpcProvider(
				{
					url: value.url,
				},
				{
					chainId: value.chain.id,
					name: value.chain.name,
				}
			),
	])
) as { [K in keyof typeof NetworkInfo.providers]: () => JsonRpcProvider }
