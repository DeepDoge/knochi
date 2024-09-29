import { BrowserProvider, JsonRpcSigner } from "ethers";
import { ref, Signal } from "purify-js";
import walletSrc from "~/assets/svgs/wallet.svg?url";
import { config } from "../config";

interface Eip1193Provider {
	isStatus?: boolean; // Optional: Indicates the status of the provider
	host?: string; // Optional: Host URL of the Ethereum node
	path?: string; // Optional: Path to a specific endpoint or service on the host
	sendAsync?: (
		request: { method: string; params?: Array<unknown> },
		callback: (error: Error | null, response: unknown) => void,
	) => void; // For sending asynchronous requests
	send?: (
		request: { method: string; params?: Array<unknown> },
		callback: (error: Error | null, response: unknown) => void,
	) => void; // For sending synchronous requests
	request: (request: { method: string; params?: Array<unknown> }) => Promise<unknown>; // Standard method for sending requests per EIP-1193
	on(event: "accountsChanged", callback: (accounts: string[]) => void): void;
	on(event: "chainChanged", callback: (chainId: string) => void): void;
	on(event: "networkChanged", callback: (networkId: string) => void): void;
	on(event: "disconnected", callback: () => void): void;
	on(event: "error", callback: (error: Error) => void): void;
	on(event: string, callback: (...args: unknown[]) => void): void;
	off(event: string, callback: (...args: unknown[]) => void): void;
}

interface Eip6963ProviderInfo {
	rdns: string; // Unique identifier for the wallet e.g io.metamask, io.metamask.flask
	uuid: string; // Globally unique ID to differentiate between provider sessions for the lifetime of the page
	name: string; // Human-readable name of the wallet
	icon: string; // URL to the wallet's icon
}

interface Eip6963ProviderDetail {
	info: Eip6963ProviderInfo; // The provider's info
	provider: Eip1193Provider; // The Eip-1193 compatible provider
}

type Eip6963AnnounceProviderEvent = CustomEvent<Eip6963ProviderDetail>;

declare global {
	interface Window {
		ethereum?: Eip1193Provider;
	}

	interface WindowEventMap {
		"eip6963:announceProvider": Eip6963AnnounceProviderEvent;
	}
}

export type WalletDetail = {
	ethereum: Eip1193Provider;
	provider: BrowserProvider;
	signer: Signal<JsonRpcSigner | null>;
	info: {
		key: string;
		name: string;
		icon: string;
	};
};

export const walletDetails = ref<WalletDetail[]>([]);
function addWalletDetail(ethereum: Eip1193Provider, info: WalletDetail["info"]) {
	const signer = ref<WalletDetail["signer"]["val"]>(null);
	const walletDetail: WalletDetail = {
		ethereum,
		provider: new BrowserProvider(ethereum),
		signer,
		info,
	};
	ethereum.on("accountsChanged", () => {
		getSigner(walletDetail).then((value) => {
			signer.val = value;
		});
	});
	getSigner(walletDetail).then((value) => {
		signer.val = value;
	});

	walletDetails.val.unshift(walletDetail);
	walletDetails.emit();
}

if (window.ethereum) {
	addWalletDetail(window.ethereum, {
		key: "eip1193",
		name: "Browser Wallet",
		icon: walletSrc,
	});
}

window.addEventListener("eip6963:announceProvider", (event) => {
	console.log(event.detail.info);
	if (walletDetails.val.some((p) => p.info.key === event.detail.info.rdns)) return;
	addWalletDetail(event.detail.provider, {
		key: event.detail.info.rdns,
		name: event.detail.info.name,
		icon: event.detail.info.icon,
	});
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

export const currentWalletDetail = ref<WalletDetail | null>(null);

// Later there should be a network choise
const network = config.val.networks[0];

export async function getOrRequestSigner(walletDetail = currentWalletDetail.val) {
	currentWalletDetail.val = walletDetail;
	if (!walletDetail) return null;

	// Get the chain ID as a hex string
	// - Should be 0x prefixed
	// - Shouldnt have padding
	const chainIdHex = `0x${network.chainId.toString(16)}`;

	// Attempt to switch to the network
	await walletDetail.ethereum
		.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainIdHex }] })
		.catch(async (error) => {
			console.error("Failed to switch network, attempting to add it:", error);

			// If switching fails, add the network
			await walletDetail.ethereum
				.request({
					method: "wallet_addEthereumChain",
					params: [
						{
							chainId: chainIdHex,
							rpcUrls: network.providers,
							chainName: network.name,
							nativeCurrency: {
								name: network.nativeCurrency.symbol,
								symbol: network.nativeCurrency.symbol,
								decimals: network.nativeCurrency.decimals,
							},
							blockExplorerUrls: [network.blockExplorer],
						},
					],
				})
				.catch((addError) => {
					const message = "Failed to add the network";
					console.error(message, addError);
					return new Error(message);
				});

			// Attempt to switch to the network again after adding
			await walletDetail.ethereum
				.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainIdHex }] })
				.catch((switchError) => {
					const message = "Failed to switch to the network after adding";
					console.error(message, switchError);
					return new Error(message);
				});
		});

	// Create and return the signer
	const signer = walletDetail.provider.getSigner();
	return signer;
}

export async function getSigner(walletDetail = currentWalletDetail.val) {
	if (!walletDetail) return null;
	return await walletDetail.provider.listAccounts().then((accounts) => accounts[0] ?? null);
}
