import { createLayout } from "@/router"
import { defineComponent } from "master-ts/library/component"
import { html } from "master-ts/library/template"

export const homeLayout = createLayout<void>(() => {
	const PageComponent = defineComponent("x-home-layout-page")
	const page = new PageComponent()
	page.$html = html` <h1>Home</h1> `

	const TopComponent = defineComponent("x-home-layout-top")
	const top = new TopComponent()
	top.$html = html``

	return {
		top,
		page,
	}
})
