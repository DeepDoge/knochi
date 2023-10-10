import { commonStyle } from "@/import-styles"
import { createLayout } from "@/routes"
import { fragment } from "master-ts/core"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"

const homePageTag = defineCustomTag("x-home-layout-page")
export const homeLayout = createLayout(() => {
	const root = homePageTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle)

	dom.append(fragment(html` <h1>Home</h1> `))

	return {
		top: null,
		page: root,
	}
})
