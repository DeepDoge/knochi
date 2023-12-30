import { commonStyle } from "@/import-styles"
import { routeHash } from "@/router"
import type { Address } from "@/utils/address"
// @ts-ignore
import jazzicon_ from "@metamask/jazzicon"
import { SignalOrFn, css, customTag, derive, sheet, signalFrom, tags } from "master-ts"

const jazzicon = jazzicon_ as { (diameter: number, seed: number): HTMLElement }

const { a, img } = tags

const profileAvatarTag = customTag("x-profile-avatar")
export function ProfileAvatarUI(addressSignal: SignalOrFn<Address>) {
	const address = signalFrom(addressSignal)

	const root = profileAvatarTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const avatarUrl = derive(
		() =>
			`data:image/svg+xml;base64,${window.btoa(
				new XMLSerializer().serializeToString(jazzicon(100, parseInt(address.ref.substring("0x".length, 10), 16)).querySelector("svg")!)
			)}`
	)

	dom.append(a({ class: "avatar", href: () => routeHash({ path: address.ref, postId: null }) }, [img({ src: avatarUrl, alt: "Avatar of " + address })]))

	return root
}

const style = sheet(css`
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
`)
