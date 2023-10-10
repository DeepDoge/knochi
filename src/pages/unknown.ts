import { commonStyle } from "@/import-styles"
import { createLayout } from "@/routes"
import { fragment } from "master-ts/core"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"

const unknownPageTag = defineCustomTag("x-unknown-layout-page")
export const unknownLayout = createLayout(() => {
	const root = unknownPageTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle)

	dom.append(fragment(html` <h1>Unknown Page</h1> `))

	return {
		top: null,
		page: root,
	}
})
