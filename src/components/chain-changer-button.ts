import { spawnFloatingBox } from "@/components/floating-box"
import { commonStyle } from "@/import-styles"
import { Wallet } from "@/utils/wallet"
import { derive, fragment } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"
import { match } from "master-ts/extra/match"
import { ChainButtonUI } from "./chain-button"
import { ChainChangerUI } from "./chain-changer"

const chainChangerButtonTag = defineCustomTag("x-chain-changer-button")

export function ChainChangerButtonUI() {
	const root = chainChangerButtonTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const wallet = Wallet.browserWallet

	dom.append(
		fragment(
			match(wallet)
				.case(null, () => null)
				.default(
					(wallet) =>
						html`
							<x
								${ChainButtonUI(derive(() => wallet.ref.chainKey))}
								on:click=${(e: MouseEvent) => (e.preventDefault(), spawnFloatingBox(e, ChainChangerUI()))}></x>
						`
				)
		)
	)

	return root
}

const style = css`
	:host {
		display: grid;
		width: 3.5em;
		aspect-ratio: 1;
	}
`
