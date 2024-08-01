import { BrowserProvider, Eip1193Provider, JsonRpcSigner } from "ethers";
import { ref } from "purified-js";

declare global {
	interface Window {
		ethereum?: Eip1193Provider & {
			on(event: "accountsChanged", callback: (accounts: string[]) => void): void;
			on(event: "chainChanged", callback: (chainId: string) => void): void;
			on(event: "networkChanged", callback: (networkId: string) => void): void;
			on(event: "disconnected", callback: () => void): void;
			on(event: "error", callback: (error: Error) => void): void;
			on(event: string, callback: (...args: unknown[]) => void): void;
			off(event: string, callback: (...args: unknown[]) => void): void;
		};
	}
}

const browserProvider = window.ethereum ? new BrowserProvider(window.ethereum) : null;

export async function getOrRequestSigner() {
	if (!browserProvider) return null;
	const signer = await browserProvider.getSigner();
	return signer;
}

export async function getSigner() {
	if (!browserProvider) return null;
	return await browserProvider.listAccounts().then((accounts) => accounts[0] ?? null);
}

export const signer = ref<JsonRpcSigner | null>(null);
if (window.ethereum) {
	window.ethereum.on("accountsChanged", () => {
		getSigner().then((value) => {
			signer.val = value;
		});
	});
	getSigner().then((value) => {
		signer.val = value;
	});
}
