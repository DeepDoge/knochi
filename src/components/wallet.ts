import { spawnFloatingBox } from "@/components/floating-box"
import { ProfileUI } from "@/components/profile"
import { Wallet } from "@/utils/wallet"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { html, type TemplateValue } from "master-ts/library/template"
import { ChainChangerUI } from "./chain-changer"

const MyWalletComponent = defineComponent("x-my-wallet")
export function MyWalletUI() {
	const component = new MyWalletComponent()

	component.$html = html` ${requireWallet((wallet) => html` <x ${ProfileUI($.derive(() => wallet.ref.address))}></x>`)} `

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
						html`
							<button class="btn" on:click=${(e: MouseEvent) => (e.preventDefault(), spawnFloatingBox(e, ChainChangerUI()))}>
								Wrong Network
							</button>
						`
				)
				.default(() => null)
		)
		.default((wallet) => then(wallet))
}
