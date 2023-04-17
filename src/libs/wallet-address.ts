import { routeHash } from "@/route"
import type { Address } from "@/utils/address"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

const WalletAddressComponent = defineComponent("x-wallet-address")
export function WalletAddress(address: Address) {
	const component = new WalletAddressComponent()

	component.$html = html`
		<button
			href=${routeHash({ path: address })}
			on:click=${(e) => (e.preventDefault(), navigator.clipboard.writeText(address).then(() => alert(`Address copied to clipboard\nTODO: Add toast notifactions etc..`)))}
			title=${address}
			aria-label="wallet address, click to copy"
		>
			<span>${address.substring(0, address.length - 4)}</span><span>${address.substring(address.length - 4)}</span>
		</button>
	`

	return component
}
WalletAddressComponent.$css = css`
	:host {
		display: contents;
	}

	button {
		all: unset;
		font: inherit;
		cursor: pointer;
        padding-inline: .5ch;

        background-color: transparent;

        transition: var(--transition);
        transition-property: background-color;

		&:hover {
			background-color: hsl(var(--base-text-hsl), 10%)
		}

        &:active {
			background-color: hsl(var(--base-text-hsl), 20%)
		}
	}

	button {
		display: inline-grid;
		grid-template-columns: 1fr auto;
		max-width: 20ch;
		color: inherit;

		& > span:first-child {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
`
