import { Profile } from "@/libs/profile"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { html, TemplateValue } from "master-ts/library/template"
import { WalletApi } from "../api/wallet"
import { spawnFloatingBox } from "./floating-box"

// TODO: on wrong network, when clicked show a drop down of chains and select to chain to switch to
const WalletComponent = defineComponent("x-wallet")
export function Wallet() {
	const component = new WalletComponent()

	component.$html = html` ${requireWallet((wallet) => html` <x ${Profile($.derive(() => wallet.ref.address))}></x>`)} `

	return component
}

export function requireWallet(then: (wallet: SignalReadable<WalletApi.Wallet>) => TemplateValue) {
	return $.match(WalletApi.browserWallet)
		.case(null, () =>
			$.match(WalletApi.browserWalletState)
				.case(
					"not-connected",
					() => html`<button class="btn" on:click=${(e) => (e.preventDefault(), WalletApi.connectWallet())}>Connect Wallet</button>`
				)
				.case(
					"wrong-network",
					() =>
						html`
							<button class="btn" on:click=${(e: MouseEvent) => (e.preventDefault(), spawnFloatingBox(e, "TODO: Change network thingy"))}>
								Wrong Network
							</button>
						`
				)
				.default(() => null)
		)
		.default((wallet) => then(wallet))
}
