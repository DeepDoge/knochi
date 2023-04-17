import { defineComponent } from "master-ts/library/component"
import { html } from "master-ts/library/template"

const UnknownPageComponent = defineComponent("x-unknown")
export function UnknownPage() {
	const component = new UnknownPageComponent()

	component.$html = html`
		<h1>Unknown Page</h1>
	`

	return component
}
