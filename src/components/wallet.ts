import { wallet, type Wallet } from "@/api/wallet"
import { spawnFloatingBox } from "@/components/floating-box"
import { Profile } from "@/components/profile"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { html, type TemplateValue } from "master-ts/library/template"
import { ChainChanger } from "./chain-changer"

const MyWalletComponent = defineComponent("x-my-wallet")
export function MyWallet() {
	const component = new MyWalletComponent()

	component.$html = html` ${requireWallet((wallet) => html` <x ${Profile($.derive(() => wallet.ref.address))}></x>`)} `

	return component
}

export function requireWallet(then: (wallet: SignalReadable<Wallet>) => TemplateValue) {
	return $.match(wallet.browserWallet)
		.case(null, () =>
			$.match(wallet.browserWalletState)
				.case("not-connected", () => html`<button class="btn" on:click=${(e) => (e.preventDefault(), wallet.connect())}>Connect Wallet</button>`)
				.case(
					"wrong-network",
					() =>
						html`
							<button class="btn" on:click=${(e: MouseEvent) => (e.preventDefault(), spawnFloatingBox(e, ChainChanger()))}>Wrong Network</button>
						`
				)
				.default(() => null)
		)
		.default((wallet) => then(wallet))
}
