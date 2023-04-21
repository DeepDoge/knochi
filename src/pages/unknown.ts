import { createLayout } from "@/router"
import { defineComponent } from "master-ts/library/component"
import { html } from "master-ts/library/template"

export const unknownLayout = createLayout<void>(() => {
	const PageComponent = defineComponent("x-unknown-layout-page")
	const page = new PageComponent()
	page.$html = html` <h1>Unknown Page</h1> `

	const TopComponent = defineComponent("x-unknown-layout-top")
	const top = new TopComponent()
	top.$html = html``

	return {
		top,
		page,
	}
})
