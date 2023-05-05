import { routeHref } from "@/router"
import type { Address } from "@/utils/address"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"

const ProfileAvatarComponent = defineComponent("x-profile-avatar")
export function ProfileAvatar(address: SignalReadable<Address>) {
	const component = new ProfileAvatarComponent()

	component.$html = html` <a class="avatar" href=${() => routeHref({ path: address.ref, postId: null })}></a> `

	return component
}

ProfileAvatarComponent.$css = css`
	:host {
		display: grid;
	}

	.avatar {
		aspect-ratio: 1;
		width: 100%;
		background-color: hsl(var(--slave-hsl));
		border-radius: var(--radius-fab);
	}
`
