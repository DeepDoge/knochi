import { wallet } from "@/api/wallet"
import { spawnFloatingBox } from "@/components/floating-box"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"
import { ChainButton } from "./chain-button"
import { ChainChanger } from "./chain-changer"

const ChainChangerButtonComponent = defineComponent("x-chain-changer-button")
export function ChainChangerButton() {
	const component = new ChainChangerButtonComponent()

	component.$html = html`
		${$.match(wallet.browserWallet)
			.case(null, () => null)
			.default(
				(wallet) =>
					html`
						<x
							${ChainButton($.derive(() => wallet.ref.chainKey))}
							on:click=${(e: MouseEvent) => (e.preventDefault(), spawnFloatingBox(e, ChainChanger()))}></x>
					`
			)}
	`

	return component
}

ChainChangerButtonComponent.$css = css`
	:host {
		display: grid;
		width: 3.5em;
		aspect-ratio: 1;
	}
`