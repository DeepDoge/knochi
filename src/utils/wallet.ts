import { BrowserProvider, Eip1193Provider } from "ethers"

declare global {
	interface Window {
		ethereum: Eip1193Provider
	}
}

export async function getSigner() {
	const browserProvider = new BrowserProvider(window.ethereum)
	return await browserProvider.getSigner()
}
