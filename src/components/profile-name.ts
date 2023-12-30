import { commonStyle } from "@/import-styles"
import { routeHash } from "@/router"
import type { Address } from "@/utils/address"
import { css, customTag, fragment, sheet, signalFrom, SignalOrFn, tags } from "master-ts"

const { a } = tags

const profileNameTag = customTag("x-profile-name")
export function ProfileNameUI(addressSignal: SignalOrFn<Address>) {
	const address = signalFrom(addressSignal)

	const root = profileNameTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	dom.append(fragment(a({ class: "name", href: () => routeHash({ path: address.ref, postId: null }) }, ["Nameless"])))

	return root
}

const style = sheet(css`
	:host {
		display: grid;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`)
