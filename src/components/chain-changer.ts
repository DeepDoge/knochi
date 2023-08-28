import { Networks } from "@/networks"
import { Wallet } from "@/utils/wallet"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css } from "master-ts/library/template/tags/css"
import { html } from "master-ts/library/template/tags/html"
import { ChainButtonUI } from "./chain-button"

const ChainChangerComponent = defineComponent("x-chain-changer")
export function ChainChangerUI() {
	const component = new ChainChangerComponent()

	const chainKeys = Object.keys(Networks.chains) as (keyof typeof Networks.chains)[]

	component.$html = html`
		<div class="title">Change Network</div>
		<div class="chains">
			${chainKeys.map((key) => html`<x ${ChainButtonUI($.derive(() => key))} on:click=${(e) => (e.preventDefault(), Wallet.changeChain(key))}></x>`)}
		</div>
	`

	return component
}

ChainChangerComponent.$css = css`
	:host {
		display: grid;
		grid-auto-flow: row;
		place-items: center;
		gap: calc(var(--span));
		padding: calc(var(--span) * 0.5);
		padding-bottom: calc(var(--span) * 1.5);

		background-color: hsl(var(--base--hsl));
		color: hsl(var(--base-text--hsl));
		border: solid 1px hsl(var(--primary--hsl));
		border-radius: var(--radius);
	}

	.title {
		font-weight: bold;
	}

	.chains {
		display: grid;
		gap: calc(var(--span));
		width: min(100vw, 15em);
		grid-template-columns: repeat(auto-fit, 2.5em);
		place-content: center;
	}
`
