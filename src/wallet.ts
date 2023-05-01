import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { html } from "master-ts/library/template"
import { walletApi } from "./api/wallet"
import { Profile } from "./libs/profile"

const WalletComponent = defineComponent("x-wallet")
export function Wallet() {
	const component = new WalletComponent()

	component.$html = html`
		${$.match(walletApi.web3Wallet)
			.case(
				null,
				() =>
					html`<button class="btn" on:click=${(e) => (e.preventDefault(), walletApi.connectWallet())}>
						Connect Wallet
					</button>`
			)
			.default((web3Wallet) => html` <x ${Profile($.derive(() => web3Wallet.ref.address))}></x>`)}
	`

	return component
}
