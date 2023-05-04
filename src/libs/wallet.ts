import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { html } from "master-ts/library/template"
import { walletApi } from "../api/wallet"
import { Profile } from "@/libs/profile"

// TODO: on wrong network, when clicked show a drop down of chains and select to chain to switch to
// TODO: on post form post button should also show connect wallet or wrong network while not connected to a valid network, so maybe seperete this to something like wallet-action-button or something like that idk, or require-wallet

const WalletComponent = defineComponent("x-wallet")
export function Wallet() {
	const component = new WalletComponent()

	component.$html = html`
		${$.match(walletApi.web3Wallet)
			.case(
				walletApi.NotConnectedSymbol,
				() => html`<button class="btn" on:click=${(e) => (e.preventDefault(), walletApi.connectWallet())}>Connect Wallet</button>`
			)
			.case(walletApi.WrongNetworkSymbol, () => html` <button class="btn" on:click=${(e) => (e.preventDefault(), e)}>Wrong Network</button> `)
			.default((web3Wallet) => html` <x ${Profile($.derive(() => web3Wallet.ref.address))}></x>`)}
	`

	return component
}
