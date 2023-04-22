import { createLayout } from "@/router"
import { defineComponent } from "master-ts/library/component"
import { html } from "master-ts/library/template"

export const homeLayout = createLayout<void>(() => {
	const PageComponent = defineComponent("x-home-layout-page")
	const page = new PageComponent()
	page.$html = html` <h1>Home</h1> `

	return {
		top: null,
		page,
	}
})
