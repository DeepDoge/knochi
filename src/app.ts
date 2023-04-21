import networks from "@/../graph/networks.json"
import globalCss from "@/styles/global.css"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { Component, defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"
import { Navigation } from "./navigation"
import { PostPage } from "./libs/postTimeline"
import { route } from "./route"
import { routerLayout } from "./router"
import { PostDB__factory } from "./typechain"
import { encodePostContent } from "./utils/post-db"

const appCssSheet = new CSSStyleSheet()
appCssSheet.replace(globalCss)
Component.$globalCSS = [appCssSheet]

declare namespace globalThis {
	export const ethereum: ethers.providers.ExternalProvider
}

const provider = new ethers.providers.Web3Provider(globalThis.ethereum, "any")
// Prompt user for account connections
await provider.send("eth_requestAccounts", [])
const signer = provider.getSigner()

const PostDB = new PostDB__factory(signer)
const postDB = PostDB.attach(networks.sepolia.PostDB.address)

async function post(data: Uint8Array) {
	await postDB.post(data)
}

const AppComponent = defineComponent("x-app")
function App() {
	const component = new AppComponent()

	const text = $.writable("")
	const data = $.derive(() => encodePostContent([{ type: "text", value: ethers.utils.toUtf8Bytes(text.ref) }]))

	component.$html = html`
		<header>${Navigation()}</header>
		<main>
			<div class="top">${() => routerLayout.ref.top}</div>
			<div class="bottom">
				<div class="page">${() => routerLayout.ref.page}</div>
				${() => (route.postId.ref ? html`<div class="post">${PostPage(route.postId.ref)}</div>` : null)}
			</div>
		</main>
	`

	return component
}

AppComponent.$css = css`
	:host {
		display: grid;
		padding-top: var(--span);
	}

	header {
		position: fixed;
		bottom: var(--span);
		width: 100%;
		z-index: 10;

		display: grid;
		justify-content: center;
		align-items: center;
	}

	main {
		display: grid;
		gap: var(--span);
		padding: 0 var(--span);

		& > .bottom {
			position: relative;
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
			gap: var(--span);

			& > * {
				overflow: auto;
				padding-bottom: 10vh;

				&.post {
					position: sticky;
					top: 0;
					height: calc(100vh);
				}
			}
		}
	}
`

document.querySelector("#app")!.replaceWith(App())
