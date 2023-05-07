import { Wallet } from "@/api/wallet"
import { spawnFloatingBox } from "@/libs/floating-box"
import { Profile } from "@/libs/profile"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { html, type TemplateValue } from "master-ts/library/template"

// TODO: on wrong network, when clicked show a drop down of chains and select to chain to switch to
const MyWalletComponent = defineComponent("x-my-wallet")
export function MyWallet() {
	const component = new MyWalletComponent()

	component.$html = html` ${requireWallet((wallet) => html` <x ${Profile($.derive(() => wallet.ref.address))}></x>`)} `

	return component
}

export function requireWallet(then: (wallet: SignalReadable<Wallet>) => TemplateValue) {
	return $.match(Wallet.browserWallet)
		.case(null, () =>
			$.match(Wallet.browserWalletState)
				.case("not-connected", () => html`<button class="btn" on:click=${(e) => (e.preventDefault(), Wallet.connect())}>Connect Wallet</button>`)
				.case(
					"wrong-network",
					() =>
						html` <button class="btn" on:click=${(e: MouseEvent) => (e.preventDefault(), spawnFloatingBox(e, MyWallet()))}>Wrong Network</button> `
				)
				.default(() => null)
		)
		.default((wallet) => then(wallet))
}
