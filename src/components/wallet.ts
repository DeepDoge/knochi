import { spawnFloatingBox } from "@/components/floating-box"
import { ProfileUI } from "@/components/profile"
import { commonStyle } from "@/import-styles"
import { Wallet } from "@/utils/wallet"
import { derive, fragment, type Signal, type TagsNS } from "master-ts/core"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"
import { match } from "master-ts/extra/match"
import { ChainChangerUI } from "./chain-changer"

const myWalletTag = defineCustomTag("x-my-wallet")
export function MyWalletUI() {
	const root = myWalletTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle)

	dom.append(fragment(html` ${requireWallet((wallet) => html` <x ${ProfileUI(derive(() => wallet.ref.address))}></x>`)} `))

	return root
}

export function requireWallet(then: (wallet: Readonly<Signal<Wallet>>) => TagsNS.AcceptedChild) {
	// TODO: this and many other `match` signals can be simplified with the new feature of `match`
	// `Wallet` itself can be simplified.
	return match(Wallet.browserWallet)
		.case(null, () =>
			match(Wallet.browserWalletState)
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
