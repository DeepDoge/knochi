import appCss from "@/styles/app.css"
import { Component, defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

const appCssSheet = new CSSStyleSheet()
appCssSheet.replace(appCss)
Component.$globalCSS = [appCssSheet]


const AppComponent = defineComponent()

function App() {
	const component = new AppComponent()

	component.$html = html`
		<section>
			<h1>DForum</h1>
		</section>
	`

	return component
}

AppComponent.$css = css`

`

document.querySelector("#app")!.replaceWith(App())
