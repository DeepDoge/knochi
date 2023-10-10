import { commonStyle } from "@/import-styles"
import { routeHash } from "@/router"
import type { Address } from "@/utils/address"
import { fragment, type Signal } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"

const profileNameTag = defineCustomTag("x-profile-name")
export function ProfileNameUI(address: Signal<Address>) {
	const root = profileNameTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	dom.append(fragment(html` <a class="name" href=${() => routeHash({ path: address.ref, postId: null })}>Nameless</a> `))

	return root
}

const style = css`
	:host {
		display: grid;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`
