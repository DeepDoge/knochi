import { css, customTag, populate, sheet } from "cherry-ts"
import { PostForm } from "./libs/PostForm"
import { Timeline } from "./libs/Timeline"
import { globalSheet } from "./styles"

const appTag = customTag("x-app")
function App() {
	const root = appTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(globalSheet, appSheet)

	populate(dom, [PostForm(), Timeline()])

	return root
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

document.body.append(App())
