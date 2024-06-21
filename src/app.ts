import { css, fragment, sheet, tags } from "purify-js"
import { PostForm } from "./libs/PostForm"
import { globalSheet } from "./styles"

const { div } = tags

function App() {
	const host = div()
	const shadow = host.element.attachShadow({ mode: "open" })
	shadow.adoptedStyleSheets.push(globalSheet, appSheet)

	shadow.append(fragment(PostForm()))

	return host
}

const appSheet = sheet(css`
	:host {
		display: grid;
		gap: 1em;
		padding: 1em;
		grid-template-columns: minmax(0, 30em);
		justify-content: center;
	}
`)

document.body.append(App().element)
