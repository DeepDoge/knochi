import { connect_EternisPost, type EternisPost_Contract } from "@/contracts/artifacts/EternisPost"
import { connect_EternisTipPost, type EternisTipPost_Contract } from "@/contracts/artifacts/EternisTipPost"
import { Networks } from "@/networks"
import { Address } from "@/utils/address"
import { ethers } from "ethers"
import { derive, signal } from "master-ts/core"

export type Wallet = {
	chainKey: Networks.ChainKey
	signer: ethers.JsonRpcSigner
	provider: ethers.BrowserProvider
	address: Address
	contracts: {
		EternisPost: EternisPost_Contract
		EternisTipPost: EternisTipPost_Contract
	}
}

const _check: keyof (typeof Networks.contracts)[Networks.ChainKey] extends keyof Wallet["contracts"] ? string : "" =
	"You didn't update the Wallet type to include the new contract."
_check

export namespace Wallet {
	const ethereum = "ethereum" in window ? (window.ethereum as ethers.Eip1193Provider & ethers.BrowserProvider) : null
	export type State = "wrong-network" | "not-connected" | "connected"

	let browserProvider: ethers.BrowserProvider | null = null
	if (ethereum) {
		browserProvider = new ethers.BrowserProvider(ethereum, "any")
		browserProvider.listAccounts().then((accounts) => {
			const isConnected = accounts.length > 0
			if (isConnected) connect()
		})
		ethereum.on("accountsChanged", () => connect())
		ethereum.on("chainChanged", () => connect())
	}

	const browserWalletStateWritable = signal<State>("not-connected")
	const browserWalletWritable = signal<Wallet | null>(null)
	export const browserWallet = derive(() => browserWalletWritable.ref)
	export const browserWalletState = derive(() => browserWalletStateWritable.ref)

	export async function connect() {
		browserProvider = ethereum && new ethers.BrowserProvider(ethereum, "any")
		if (!browserProvider) throw new Error("Browser Wallet cannot be found.")

		await browserProvider.send("eth_requestAccounts", [])
		const signer = await browserProvider.getSigner()

		const chainId = (await browserProvider.getNetwork()).chainId
		const chainKey = Networks.chainIdToKeyMap.get(chainId)
		if (!chainKey) {
			browserWalletStateWritable.ref = "wrong-network"
			browserWalletWritable.ref = null
			throw new Error(`Chain key for chain id:${chainId} cannot be found`)
		}

		browserWalletWritable.ref = {
			chainKey,
			signer,
			provider: browserProvider,
			address: Address.from(await signer.getAddress()),
			contracts: {
				EternisPost: connect_EternisPost(Networks.contracts[chainKey].EternisPost, signer),
				EternisTipPost: connect_EternisTipPost(Networks.contracts[chainKey].EternisTipPost, signer),
			},
		}
		browserWalletStateWritable.ref = "connected"
	}

	export async function changeChain(chainKey: Networks.ChainKey) {
		const chainConfig = Networks.chains[chainKey]
		const providerConfig = Networks.rpcProviders[chainKey]
		if (!browserProvider) return
		try {
			await browserProvider.send("wallet_switchEthereumChain", [{ chainId: ethers.toBeHex(chainConfig.id) }])
		} catch (err) {
			// This error code indicates that the chain has not been added to MetaMask
			if (err && typeof err === "object" && "code" in err) {
				type JsonRpcProviderConfig = {
					chainName: string
					chainId: string
					nativeCurrency: { name: string; decimals: number; symbol: string }
					rpcUrls: string[]
					blockExplorerUrls: string[]
				}

				const config = {
					chainName: chainConfig.name,
					chainId: ethers.toBeHex(chainConfig.id),
					nativeCurrency: chainConfig.currency,
					blockExplorerUrls: [providerConfig.blockExplorer.href],
					rpcUrls: [providerConfig.rpc.href],
				} satisfies JsonRpcProviderConfig

				console.log(config)

				await browserProvider.send("wallet_addEthereumChain", [config])
			} else throw err
		}
	}
}
