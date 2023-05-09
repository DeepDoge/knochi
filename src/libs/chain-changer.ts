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
		${$.each(chainEntries).as(
			([key, chain]) => html` <button class="btn" on:click=${(e) => (e.preventDefault(), Wallet.changeChain(key))}>${chain.name}</button> `
		)}
	`

	return component
}

ChainChangerComponent.$css = css``
