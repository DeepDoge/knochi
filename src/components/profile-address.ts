import { Copy2Svg } from "@/assets/svgs/copy2"
import { commonStyle } from "@/import-styles"
import type { Address } from "@/utils/address"
import { fragment, type Signal } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"

const profileAddressTag = defineCustomTag("x-profile-address")
export function ProfileAddressUI(address: Signal<Address>) {
	const root = profileAddressTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	dom.append(
		fragment(html`
			<button
				on:click=${(e) => (
					e.preventDefault(),
					navigator.clipboard.writeText(address.ref).then(() => alert(`Address copied to clipboard\nTODO: Add toast notifactions etc..`))
				)}
				title=${address}
				aria-label="wallet address, click to copy">
				<x ${Copy2Svg()} aria-hidden></x>
				<span>${() => address.ref.substring(0, address.ref.length - 4)}</span><span>${() => address.ref.substring(address.ref.length - 4)}</span>
			</button>
		`)
	)

	return root
}

const style = css`
	:host {
		display: inline-grid;
	}

	button {
		border: none;
		padding: 0;
		appearance: none;
		cursor: pointer;
		font: inherit;
	}

	button {
		display: inline-grid;
		grid-template-areas: "address-start address-end . svg";
		grid-template-columns: 1fr auto 0.5ch 1em;
		align-items: center;
		max-width: 20ch;
		min-width: 9ch;

		& > svg {
			grid-area: svg;
		}

		& > span:nth-child(1 of span) {
			grid-area: address-start;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		& > span:nth-child(2 of span) {
			grid-area: address-end;
		}
	}

	/* glass effect */
	button {
		background-color: transparent;

		transition: var(--transition);
		transition-property: background-color;

		&:hover {
			background-color: hsl(var(--base-text--hsl), 0.1);
		}
		&:active {
			background-color: hsl(var(--base-text--hsl), 0.2);
		}
	}
`
