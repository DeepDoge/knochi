import { globalSheet } from "@/styles"
import { BrowserProvider, Eip1193Provider } from "ethers"
import { css, customTag, populate, sheet, tags } from "master-ts"

const { button } = tags

declare global {
	interface Window {
		ethereum?: Eip1193Provider
	}
}

const connectWalletTag = customTag("x-connect-wallet")
export function ConnectWallet() {
	if (!window.ethereum) return null
	const ethereum = window.ethereum
	const provider = new BrowserProvider(ethereum)
	const root = connectWalletTag()
	const shadow = root.attachShadow({ mode: "open" })
	shadow.adoptedStyleSheets.push(connectWalletSheet, globalSheet)

	return populate(shadow, [button({ class: "button" }, ["Browser Wallet"])])
}

const connectWalletSheet = sheet(css`
	:host {
		display: grid;
	}
`)
