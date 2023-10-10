import { Networks } from "@/networks"
import { Wallet } from "@/utils/wallet"
import { derive, fragment } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"
import { ChainButtonUI } from "./chain-button"

const chainChangerTag = defineCustomTag("x-chain-changer")

export function ChainChangerUI() {
	const root = chainChangerTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(style)

	const chainKeys = Object.keys(Networks.chains) as (keyof typeof Networks.chains)[]

	dom.append(
		fragment(
			html`
				<div class="title">Change Network</div>
				<div class="chains">
					${chainKeys.map((key) => {
						const chainKey = derive(() => key)
						return html`
							<x
								${ChainButtonUI(chainKey)}
								on:click=${(e: MouseEvent) => {
									e.preventDefault()
									Wallet.changeChain(key)
								}}></x>
						`
					})}
				</div>
			`
		)
	)

	return root
}

const style = css`
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
