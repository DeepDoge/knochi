import { spawnFloatingBox } from "@/components/floating-box"
import { ProfileUI } from "@/components/profile"
import { commonStyle } from "@/import-styles"
import { Wallet } from "@/utils/wallet"
import { Signal, Template, customTag, derive, fragment, match, tags } from "master-ts"
import { ChainChangerUI } from "./chain-changer"

const { button } = tags

const myWalletTag = customTag("x-my-wallet")
export function MyWalletUI() {
	const root = myWalletTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle)

	dom.append(fragment(requireWallet((wallet) => ProfileUI(derive(() => wallet.ref.address)))))

	return root
}

export function requireWallet(then: (wallet: Signal<Wallet>) => Template.Member) {
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
