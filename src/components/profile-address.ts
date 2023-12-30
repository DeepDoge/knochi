import { Copy2Svg } from "@/assets/svgs/copy2"
import { commonStyle } from "@/import-styles"
import type { Address } from "@/utils/address"
import { css, customTag, fragment, populate, sheet, signalFrom, SignalOrFn, tags } from "master-ts"

const { button, span } = tags

const profileAddressTag = customTag("x-profile-address")
export function ProfileAddressUI(addressSignal: SignalOrFn<Address>) {
	const address = signalFrom(addressSignal)

	const root = profileAddressTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	dom.append(
		fragment(
			button(
				{
					class: "address",
					"on:click": (e) => (
						e.preventDefault(),
						navigator.clipboard.writeText(address.ref).then(() => alert(`Address copied to clipboard\nTODO: Add toast notifactions etc..`))
					),
				},
				[
					span({ class: "address-start" }, [address.ref.substring(0, address.ref.length - 4)]),
					span({ class: "address-end" }, [address.ref.substring(address.ref.length - 4)]),
					span({ class: "svg" }, [populate(Copy2Svg(), { "aria-hidden": true })]),
				]
			)
		)
	)

	return root
}

const style = sheet(css`
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
`)
