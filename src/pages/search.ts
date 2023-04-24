import { createLayout } from "@/router"
import { defineComponent } from "master-ts/library/component"
import { html } from "master-ts/library/template"

export const searchLayout = createLayout<{}>(() => {
	const PageComponent = defineComponent("x-search-layout-page")
	const page = new PageComponent()
	page.$html = html` <h1>Search</h1> `

	return {
		top: null,
		page,
	}
})
