import { routeHash } from "@/router"
import type { Address } from "@/utils/address"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
// @ts-ignore
import jazzicon_ from "@metamask/jazzicon"
import { $ } from "master-ts/library/$"

const jazzicon = jazzicon_ as { (diameter: number, seed: number): HTMLElement }

const ProfileAvatarComponent = defineComponent("x-profile-avatar")
export function ProfileAvatar(address: SignalReadable<Address>) {
	const component = new ProfileAvatarComponent()

	const avatarUrl = $.derive(
		() =>
			`data:image/svg+xml;base64,${window.btoa(
				new XMLSerializer().serializeToString(jazzicon(100, parseInt(address.ref.substring("0x".length, 10), 16)).querySelector("svg")!)
			)}`
	)

	component.$html = html`
		<a class="avatar" href=${() => routeHash({ path: address.ref, postId: null })}>
			<img src=${avatarUrl} alt="Avatar of ${address}" />
		</a>
	`

	return component
}

ProfileAvatarComponent.$css = css`
	:host {
		display: grid;
	}

	.avatar {
		aspect-ratio: 1;
		width: 100%;
		border-radius: var(--radius-fab);
		background-color: #eb4140; /* metamask's default background */

		contain: paint;
		position: relative;
	}

	img {
		position: absolute;
		inset: 0;
		object-fit: contain;
	}
`
