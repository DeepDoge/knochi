import { commonStyle } from "@/import-styles"
import { Networks } from "@/networks"
import { derive, fragment, type Signal } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"

const chainButtonTag = defineCustomTag("x-chain-button")
export function ChainButtonUI(key: Signal<Networks.ChainKey>) {
	const root = chainButtonTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const chain = derive(() => Networks.chains[key.ref])

	dom.append(
		fragment(html`
			<button
				class="btn"
				title=${() => chain.ref.name}
				style:--current--background-hsl=${() => chain.ref.colorBackgroundHsl}
				style:--current-text--hsl=${() => chain.ref.colorTextHsl}>
				${() => chain.ref.iconSvg()}
			</button>
		`)
	)

	return root
}

const style = css`
	:host {
		display: grid;
	}

	button {
		display: grid;
		grid-template-columns: 50%;
		place-content: center;
		aspect-ratio: 1;
		padding: 0;

		color: hsl(var(--current-text--hsl));
		background-color: hsl(var(--current--background-hsl));
	}
`
