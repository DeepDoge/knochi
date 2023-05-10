import { PostTimeline } from "@/libs/post-timeline"
import { Navigation } from "@/navigation"
import { route } from "@/router"
import { routerLayout } from "@/routes"
import globalCss from "@/styles/global.css?inline"
import { $ } from "master-ts/library/$"
import { Component, defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

const globalCssSheet = new CSSStyleSheet()
globalCssSheet.replace(globalCss)
Component.$globalCSS = [globalCssSheet]
;(document.adoptedStyleSheets ??= []).push(globalCssSheet)

const AppComponent = defineComponent("x-app")
function App() {
	const component = new AppComponent()

	component.$html = html`
		<header>${Navigation()}</header>
		<main>
			${$.match($.derive(() => routerLayout.ref.top))
				.case(null, () => null)
				.default((layoutTop) => html`<div class="top">${layoutTop}</div>`)}
			<div class="bottom">
				<div class="page">${() => routerLayout.ref.page}</div>
				${$.match(route.postId)
					.case(null, () => null)
					.default((postId) => html` <div class="post">${PostTimeline(postId)}</div>`)}
			</div>
		</main>
	`

	return component
}

AppComponent.$css = css`
	:host {
		display: grid;
		--space: var(--span);
	}

	header {
		display: grid;

		position: fixed;
		bottom: 0;
		width: 100%;
		z-index: 10;

		pointer-events: none;
		& > * {
			pointer-events: all;
		}
	}

	main {
		/* 
			Using paddings here instead of gaps on purpose
			Why? so outlines or effects like glow doesnt try to overflow, also sticky parts should have padding.
		*/
		display: grid;

		& > .top,
		& > .bottom > * {
			/* sometimes, top might not exists, so this is both padding at the top and also padding between top and bottom */
			padding-top: var(--space);
		}

		& > .top {
			padding-inline: var(--space);
		}

		& > .bottom {
			padding-inline: calc(var(--space) * 0.5);
			& > * {
				padding-bottom: 10em;
				padding-inline: calc(var(--space) * 0.5);
			}
		}
	}

	main > .bottom {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
		position: relative;
		& > .post {
			position: sticky;
			top: 0;
			height: 100vh;
			overflow: auto;
		}
	}

	@media (max-width: 1023px) {
		:host {
			font-size: 0.8em;
		}

		main > .bottom:has(.post) {
			& > .page {
				position: fixed;
				left: -200%;
			}

			& > .post {
				position: static;
				height: auto;
			}
		}
	}
`

document.querySelector("#app")?.replaceWith(App())
