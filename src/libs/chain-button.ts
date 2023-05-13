import { NetworkConfigs } from "@/api/network-config"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

const ChainButtonComponent = defineComponent("x-chain-button")
export function ChainButton(key: NetworkConfigs.ChainKey) {
	const component = new ChainButtonComponent()

	const chain = NetworkConfigs.chains[key]

	component.$html = html`
		<button class="btn" title=${chain.name} style:--current--background-hsl=${chain.colorBackgroundHsl} style:--current--text-hsl=${chain.colorTextHsl}>
			${chain.iconSvg()}
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
