import { PostDB, PostDB__factory } from "@/typechain"
import { Address } from "@/utils/address"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { networks } from "../networks"

export namespace walletApi {
	const web3WalletWritable = $.writable<{
		signer: ethers.providers.JsonRpcSigner
		provider: ethers.providers.Web3Provider
		address: Address
		contracts: {
			PostDB: PostDB
		}
	} | null>(null)
	export const web3Wallet = $.derive(() => web3WalletWritable.ref)

	declare namespace window {
		export const ethereum: ethers.providers.ExternalProvider
	}

	export async function connectWallet() {
		const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
		// Prompt user for account connections
		await provider.send("eth_requestAccounts", [])
		const signer = provider.getSigner()
		web3WalletWritable.ref = {
			signer,
			provider,
			address: Address(await signer.getAddress()),
			contracts: { PostDB: PostDB__factory.connect(networks.subgraphs.mumbai.PostDB.address, signer) },
		}
	}
}
