import { commonStyle } from "@/import-styles"
import { routeHash } from "@/router"
import type { Address } from "@/utils/address"
import { html } from "master-ts/extra/html"
// @ts-ignore
import jazzicon_ from "@metamask/jazzicon"
import { derive, fragment, type Signal } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"

const jazzicon = jazzicon_ as { (diameter: number, seed: number): HTMLElement }

const profileAvatarTag = defineCustomTag("x-profile-avatar")
export function ProfileAvatarUI(address: Signal<Address>) {
	const root = profileAvatarTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const avatarUrl = derive(
		() =>
			`data:image/svg+xml;base64,${window.btoa(
				new XMLSerializer().serializeToString(jazzicon(100, parseInt(address.ref.substring("0x".length, 10), 16)).querySelector("svg")!)
			)}`
	)

	dom.append(
		fragment(html`
			<a class="avatar" href=${() => routeHash({ path: address.ref, postId: null })}>
				<img src=${avatarUrl} alt="Avatar of ${address}" />
			</a>
		`)
	)

	return root
}

const style = css`
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
