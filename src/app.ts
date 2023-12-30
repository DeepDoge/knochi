import { PostTimelineUI } from "@/components/post-timeline"
import { Navigation } from "@/navigation"
import { route } from "@/router"
import { routerLayout } from "@/routes"
import { css, customTag, fragment, match, sheet, tags } from "master-ts"
import { globalSheet } from "./styles"

const { header, main, div } = tags

const appTag = customTag("x-app")
function App() {
	const root = appTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(globalSheet, appSheet)

	dom.append(
		fragment(
			header([Navigation()]),
			main([
				match(() => routerLayout.ref.top)
					.case(null, () => null)
					.default((layoutTop) => div({ class: "top" }, [layoutTop])),
				div({ class: "bottom" }, [
					div({ class: "page" }, [() => routerLayout.ref.page]),
					match(route.postId)
						.case(null, () => null)
						.default((postId) =>
							div({ class: "post" }, [PostTimelineUI(postId)]),
						),
				]),
			]),
		),
	)

	return root
}

const appSheet = sheet(css``)

document.body.append(App())
