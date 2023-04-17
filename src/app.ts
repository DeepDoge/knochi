import globalCss from "@/styles/global.css"
import { ethers } from "ethers"
import { Component, defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"
import { PostDB__factory } from "./typechain"
import contracts from "@/../hardhat/scripts/deployed.json"
import { encodePostContent } from "./utils/post-db"
import { $ } from "master-ts/library/$"
import { PageRouter } from "./router"

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
const postDB = PostDB.attach(contracts["80001-PostDB"])

async function post(data: Uint8Array) {
	await postDB.post(data)
}

const AppComponent = defineComponent("x-app")
function App() {
	const component = new AppComponent()

	const text = $.writable("")
	const data = $.derive(() => encodePostContent([{ type: "text", value: ethers.utils.toUtf8Bytes(text.ref) }]))

	component.$html = html`
		<section>
			${PageRouter}
			<form on:submit=${(e) => (e.preventDefault(), post(data.ref))}>
				<input type="text" bind:value=${text} placeholder="Text" />
				<div>${() => data.ref.byteLength} bytes</div>
				<button>Post</button>
			</form>
		</section>
	`

	return component
}

AppComponent.$css = css``

document.querySelector("#app")!.replaceWith(App())
