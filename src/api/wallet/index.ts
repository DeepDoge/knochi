import { networkConfigs } from "@/api/network-config"
import { connect_EternisPostDB, type EternisPostDB_Contract } from "@/contracts/artifacts/EternisPostDB"
import { Address } from "@/utils/address"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"

export type Wallet = {
	chainKey: networkConfigs.ChainKey
	signer: ethers.JsonRpcSigner
	provider: ethers.BrowserProvider
	address: Address
	contracts: {
		EternisPostDB: EternisPostDB_Contract
	}
}
export namespace wallet {
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

	const browserWalletStateWritable = $.writable<State>("not-connected")
	const browserWalletWritable = $.writable<Wallet | null>(null)
	export const browserWallet = $.derive(() => browserWalletWritable.ref)
	export const browserWalletState = $.derive(() => browserWalletStateWritable.ref)

	export async function connect() {
		browserProvider = ethereum && new ethers.BrowserProvider(ethereum, "any")
		if (!browserProvider) throw new Error("Browser Wallet cannot be found.")

		await browserProvider.send("eth_requestAccounts", [])
		const signer = await browserProvider.getSigner()

		const chainId = (await browserProvider.getNetwork()).chainId
		const chainKey = networkConfigs.chainIdToKeyMap.get(chainId)
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
				EternisPostDB: connect_EternisPostDB(networkConfigs.contracts[chainKey].EternisPostDB, signer),
			},
		}
		browserWalletStateWritable.ref = "connected"
	}

	export async function changeChain(chainKey: networkConfigs.ChainKey) {
		const chainConfig = networkConfigs.chains[chainKey]
		const providerConfig = networkConfigs.rpcProviders[chainKey]
		if (!browserProvider) return
		try {
			await browserProvider.send("wallet_switchEthereumChain", [{ chainId: `0x${chainConfig.id.toString(16)}` }])
		} catch (err) {
			// This error code indicates that the chain has not been added to MetaMask
			if (err && typeof err === "object" && "code" in err && err.code === 4902) {
				type JsonRpcProviderConfig = {
					chainName: string
					chainId: string
					nativeCurrency: { name: string; decimals: number; symbol: string }
					rpcUrls: string[]
					blockExplorerUrls: string[]
				}

				const config = {
					chainName: chainConfig.name,
					chainId: `0x${chainConfig.id.toString(16)}`,
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
