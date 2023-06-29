import { Networks } from "@/networks"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"

const ChainButtonComponent = defineComponent("x-chain-button")
export function ChainButtonUI(key: SignalReadable<Networks.ChainKey>) {
	const component = new ChainButtonComponent()

	const chain = $.derive(() => Networks.chains[key.ref])

	component.$html = html`
		<button
			class="btn"
			title=${() => chain.ref.name}
			style:--current--background-hsl=${() => chain.ref.colorBackgroundHsl}
			style:--current--text-hsl=${() => chain.ref.colorTextHsl}>
			${() => chain.ref.iconSvg()}
		</button>
	`

	return component
}

ChainButtonComponent.$css = css`
	:host {
		display: grid;
	}

	button {
		display: grid;
		grid-template-columns: 50%;
		place-content: center;
		aspect-ratio: 1;
		padding: 0;

		color: hsl(var(--current--text-hsl));
		background-color: hsl(var(--current--background-hsl));
	}
`
