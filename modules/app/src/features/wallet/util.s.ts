import { BrowserProvider, JsonRpcSigner } from "ethers";
import { ref, Signal } from "purified-js";
import walletSrc from "~/assets/svgs/wallet.svg?url";

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
	walletId: string; // Unique identifier for the wallet e.g io.metamask, io.metamask.flask
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

export type WalletData = {
	ethereum: Eip1193Provider;
	provider: BrowserProvider;
	signer: Signal<JsonRpcSigner | null>;
	info: {
		key: string;
		name: string;
		icon: string;
	};
};

export const walletDatas = ref<WalletData[]>([]);
function addWalletData(ethereum: Eip1193Provider, info: WalletData["info"]) {
	const signer = ref<WalletData["signer"]["val"]>(null);
	const walletData: WalletData = {
		ethereum,
		provider: new BrowserProvider(ethereum),
		signer,
		info,
	};
	ethereum.on("accountsChanged", () => {
		getSigner(walletData).then((value) => {
			signer.val = value;
		});
	});
	getSigner(walletData).then((value) => {
		signer.val = value;
	});

	walletDatas.val.unshift(walletData);
	walletDatas.notify();
}

if (window.ethereum) {
	addWalletData(window.ethereum, {
		key: "eip1193",
		name: "Browser Wallet",
		icon: walletSrc,
	});
}

window.addEventListener("eip6963:announceProvider", (event) => {
	if (walletDatas.val.some((p) => p.info.key === event.detail.info.uuid)) return;
	addWalletData(event.detail.provider, {
		key: event.detail.info.uuid,
		name: event.detail.info.name,
		icon: event.detail.info.icon,
	});
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

export const currentWalletData = ref<WalletData | null>(null);

export async function getOrRequestSigner(walletData = currentWalletData.val) {
	currentWalletData.val = walletData;
	if (!walletData) return null;
	const signer = await walletData.provider.getSigner();
	return signer;
}

export async function getSigner(walletData = currentWalletData.val) {
	if (!walletData) return null;
	return await walletData.provider.listAccounts().then((accounts) => accounts[0] ?? null);
}
