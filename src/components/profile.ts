import { ProfileAddressUI } from "@/components/profile-address"
import { ProfileAvatarUI } from "@/components/profile-avatar"
import { ProfileNameUI } from "@/components/profile-name"
import type { Address } from "@/utils/address"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css } from "master-ts/library/template/tags/css"
import { html } from "master-ts/library/template/tags/html"

const ProfileComponent = defineComponent("x-profile")
export function ProfileUI(address: SignalReadable<Address>) {
	const component = new ProfileComponent()

	component.$html = html`
		<x ${ProfileAvatarUI(address)} class="avatar"></x>
		<x ${ProfileNameUI(address)} class="name"></x>
		<div class="address">${ProfileAddressUI(address)}</div>
	`

	return component
}

ProfileComponent.$css = css`
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
