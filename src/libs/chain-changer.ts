import { NetworkConfigs } from "@/api/network-config"
import { Wallet } from "@/api/wallet"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

const ChainChangerComponent = defineComponent("x-chain-changer")
export function ChainChanger() {
	const component = new ChainChangerComponent()

	const chainEntries = Object.entries(NetworkConfigs.chains) as [
		keyof typeof NetworkConfigs.chains,
		(typeof NetworkConfigs.chains)[keyof typeof NetworkConfigs.chains]
	][]

	component.$html = html`
		<div class="title">Pick a chain</div>
		<div class="chains">
			${$.each(chainEntries).as(
				([key, chain]) =>
					html`
						<button
							class="btn"
							title=${chain.name}
							style:--current-background-hsl=${chain.colorBackgroundHsl}
							style:--current-text-hsl=${chain.colorTextHsl}
							on:click=${(e) => (e.preventDefault(), Wallet.changeChain(key))}>
							${chain.iconSvg()}
						</button>
					`
			)}
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

		background-color: hsl(var(--base-hsl));
		color: hsl(var(--base-text-hsl));
		border: solid 1px hsl(var(--master-hsl));
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

		& > * {
			display: grid;
			grid-template-columns: 50%;
			place-content: center;
			aspect-ratio: 1;
			padding: 0;

			color: hsl(var(--current-text-hsl));
			background-color: hsl(var(--current-background-hsl));
		}
	}
`
