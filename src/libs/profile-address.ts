import { Copy2Svg } from "@/assets/svgs/copy2"
import type { Address } from "@/utils/address"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"

const ProfileAddressComponent = defineComponent("x-profile-address")
export function ProfileAddress(address: SignalReadable<Address>) {
	const component = new ProfileAddressComponent()

	component.$html = html`
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
	`

	return component
}
ProfileAddressComponent.$css = css`
	:host {
		display: contents;
	}

	button {
		all: unset;
		font: inherit;
		cursor: pointer;

		background-color: transparent;

		transition: var(--transition);
		transition-property: background-color;

		&:hover {
			background-color: hsl(var(--base-text-hsl), 10%);
		}

		&:active {
			background-color: hsl(var(--base-text-hsl), 20%);
		}
	}

	button {
		display: inline-grid;
		grid-template-areas: "address-start address-end . svg";
		grid-template-columns: 1fr auto 0.5ch 1em;
		align-items: center;
		max-width: 20ch;
		min-width: 9ch;
		color: inherit;

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
`
