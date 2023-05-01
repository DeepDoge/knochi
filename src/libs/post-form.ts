import { PostId, postIdToHex } from "@/api/graph"
import { walletApi } from "@/api/wallet"
import { encodePostContent, PostContent } from "@/utils/post-db"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"

const PostFormComponent = defineComponent("x-post-form")
export function PostForm(parentId: SignalReadable<PostId>) {
	const component = new PostFormComponent()

	const state = $.writable<"loading" | "idle" | Error>("idle")
	const loading = $.derive(() => state.ref === "loading")

	const text = $.writable("")
	const postContents = $.derive<PostContent[]>(() => [
		{ type: "text", value: ethers.utils.toUtf8Bytes(text.ref) },
		...(parentId.ref ? [{ type: "parent", value: ethers.utils.arrayify(postIdToHex(parentId.ref)) }] : []),
	])
	const bytes = $.derive(() => encodePostContent(postContents.ref))

	async function sendPost() {
		try {
			state.ref = "loading"
			alert()
			await (await walletApi.web3Wallet.ref?.contracts.PostDB.post(bytes.ref))?.wait(1)
		} catch (error) {
			if (error instanceof Error) state.ref = error
			else state.ref = new Error(`${error}`)
			console.error(error)
		} finally {
			state.ref = "idle"
		}
	}

	component.$html = html`
		<form on:submit=${(e) => (e.preventDefault(), sendPost())} class:loading=${loading}>
			<textarea bind:value=${text}></textarea>
			<button>Post</button>
			<div class="byte-size">${() => bytes.ref.byteLength} bytes</div>
		</form>
	`

	return component
}

PostFormComponent.$css = css`
	form {
		display: grid;
	}

	.loading {
		opacity: 0.75;
		pointer-events: none;
		user-select: none;
		& > * {
			cursor: progress;
		}
	}
`
