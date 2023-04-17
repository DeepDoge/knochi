import appCss from "@/styles/app.css"
import { ethers } from "ethers"
import { Component, defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"
import { PostDB__factory } from "./typechain"
import contracts from "@/../hardhat/scripts/deployed.json"
import { encodePostContent } from "./utils/post-db"
import { $ } from "master-ts/library/$"

const appCssSheet = new CSSStyleSheet()
appCssSheet.replace(appCss)
Component.$globalCSS = [appCssSheet]

declare namespace globalThis {
	export const ethereum: ethers.providers.ExternalProvider
}

const provider = new ethers.providers.Web3Provider(globalThis.ethereum, "any")
// Prompt user for account connections
await provider.send("eth_requestAccounts", [])
const signer = provider.getSigner()

const PostDB = new PostDB__factory(signer)
const postDB = PostDB.attach(contracts["80001-PostDB"])

async function post(text: string) {
	await postDB.post(
		encodePostContent([
			{
				type: "text",
				value: new TextEncoder().encode(text)
			}
		])
	)
	await new Promise<void>((resolve) => postDB.once(postDB.filters.Post(), () => resolve()))
}

const AppComponent = defineComponent()
function App() {
	const component = new AppComponent()

	const text = $.writable("")

	component.$html = html`
		<section>
			<h1>DForum</h1>
			<form on:submit=${(e) => (e.preventDefault(), post(text.ref))}>
				<input type="text" bind:value=${text} placeholder="Text" />
				<button>Post</button>
			</form>
		</section>
	`

	return component
}

AppComponent.$css = css``

document.querySelector("#app")!.replaceWith(App())
