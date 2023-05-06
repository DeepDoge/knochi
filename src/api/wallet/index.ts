import { NetworkConfigs } from "@/api/network-config"
import { connect_EternisPostDB, EternisPostDB_Contract } from "@/contracts/artifacts/EternisPostDB"
import { Address } from "@/utils/address"
import { BrowserProvider, ethers } from "ethers"
import { $ } from "master-ts/library/$"

export type Wallet = {
	signer: ethers.JsonRpcSigner
	provider: ethers.BrowserProvider
	address: Address
	contracts: {
		EternisPostDB: EternisPostDB_Contract
	}
}
export namespace Wallet {
	const ethereum: (ethers.Eip1193Provider & BrowserProvider) | null = (window as any).ethereum
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
		const chainKey = NetworkConfigs.chainIdToKeyMap.get(chainId)
		if (!chainKey) {
			browserWalletStateWritable.ref = "wrong-network"
			browserWalletWritable.ref = null
			throw new Error(`Chain key for chain id:${chainId} cannot be found`)
		}

		browserWalletWritable.ref = {
			signer,
			provider: browserProvider,
			address: Address.from(await signer.getAddress()),
			contracts: {
				EternisPostDB: connect_EternisPostDB(NetworkConfigs.contracts[chainKey].EternisPostDB, signer),
			},
		}
		browserWalletStateWritable.ref = "connected"
	}

	export async function changeChain(chainKey: NetworkConfigs.ChainKey) {
		const chainConfig = NetworkConfigs.chains[chainKey]
		const providerConfig = NetworkConfigs.rpcProviders[chainKey]
		if (!browserWallet.ref) return
		try {
			await browserWallet.ref.provider.send("wallet_switchEthereumChain", [{ chainId: ethers.toBeHex(chainConfig.id) }])
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
					chainId: ethers.toBeHex(chainConfig.id),
					nativeCurrency: chainConfig.currency,
					blockExplorerUrls: [providerConfig.blockExplorer.href],
					rpcUrls: [providerConfig.rpc.href],
				} satisfies JsonRpcProviderConfig

				await browserWallet.ref.provider.send("wallet_addEthereumChain", [config])
			} else throw err
		}
	}
}
