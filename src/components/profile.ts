import { ProfileAddressUI } from "@/components/profile-address"
import { ProfileAvatarUI } from "@/components/profile-avatar"
import { ProfileNameUI } from "@/components/profile-name"
import { commonStyle } from "@/import-styles"
import type { Address } from "@/utils/address"
import { fragment, type Signal } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"

const profileTag = defineCustomTag("x-profile")
export function ProfileUI(address: Readonly<Signal<Address>>) {
	const root = profileTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	dom.append(
		fragment(html`
			<x ${ProfileAvatarUI(address)} class="avatar"></x>
			<x ${ProfileNameUI(address)} class="name"></x>
			<div class="address">${ProfileAddressUI(address)}</div>
		`)
	)

	return root
}

const style = css`
	:host {
		display: grid;
		grid-template-areas:
			"avatar . name"
			"avatar . address"
			"avatar . . ";
		grid-template-columns: 2.3em calc(var(--span) * 0.5) auto;
		place-content: start;
	}

	.avatar {
		grid-area: avatar;
	}
	.name {
		grid-area: name;
		font-weight: bold;
	}
	.address {
		grid-area: address;
		color: hsl(var(--base-text--hsl), 0.65);
		font-size: 0.9em;
	}
`
