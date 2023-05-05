import { ProfileAddress } from "@/libs/profile-address"
import type { Address } from "@/utils/address"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { ProfileAvatar } from "./profile-avatar"
import { ProfileName } from "./profile-name"

const ProfileComponent = defineComponent("x-profile")
export function Profile(address: SignalReadable<Address>) {
	const component = new ProfileComponent()

	component.$html = html`
		<x ${ProfileAvatar(address)} class="avatar"></x>
		<x ${ProfileName(address)} class="name"></x>
		<div class="address">${ProfileAddress(address)}</div>
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
	}
`
