import { defineComponent } from "master-ts/library/component"
import { html } from "master-ts/library/template"

const HomePageComponent = defineComponent()
export function HomePage() {
	const component = new HomePageComponent()

	component.$html = html`
		<h1>Home</h1>
	`

	return component
}
