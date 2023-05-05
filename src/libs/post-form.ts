import { walletApi } from "@/api/wallet"
import { encodePostContent, PostContent } from "@/utils/post-content"
import { PostId, postIdToHex } from "@/utils/post-id"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { Profile } from "./profile"
import { requireWallet } from "./wallet"

const PostFormComponent = defineComponent("x-post-form")
export function PostForm(parentId: SignalReadable<PostId | null>) {
	const component = new PostFormComponent()

	const state = $.writable<"loading" | "idle" | Error>("idle")
	const loading = $.derive(() => state.ref === "loading")

	const text = $.writable("")
	const postContents = $.derive<PostContent[]>(() => [
		{ type: "text", value: ethers.toUtf8Bytes(text.ref) },
		...(parentId.ref ? [{ type: "parent", value: ethers.toBeArray(postIdToHex(parentId.ref)) }] : []),
	])
	const bytes = $.derive(() => encodePostContent(postContents.ref))

	async function sendPost() {
		try {
			state.ref = "loading"
			if (!walletApi.browserWallet.ref) throw new Error(walletApi.browserWalletState.ref)
			await walletApi.browserWallet.ref.contracts.EternisPostDB.post(bytes.ref)
		} catch (error) {
			if (error instanceof Error) state.ref = error
			else state.ref = new Error(`${error}`)
			console.error(error)
		} finally {
			state.ref = "idle"
		}
	}

	component.$html = html`
		${requireWallet(
			(wallet) => html`
				<form on:submit=${(e) => (e.preventDefault(), sendPost())} class:loading=${loading}>
					${Profile($.derive(() => wallet.ref.address))}
					<div class="fields">
						<textarea bind:value=${text}></textarea>
					</div>
					<div class="actions">
						<button class="btn">Post</button>
					</div>
					<div class="byte-size">${() => bytes.ref.byteLength} bytes</div>
				</form>
			`
		)}
	`

	return component
}

PostFormComponent.$css = css`
	:host {
		display: grid;
	}

	form {
		display: grid;
		grid-template-areas:
			"profile	.		."
			"fields		fields 	fields"
			"size 		.		."
			". 			.		actions";
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: calc(var(--span) * 0.5);

		& > * {
			display: grid;
		}
		& > .fields {
			grid-area: fields;
		}
		& > .actions {
			grid-area: actions;
		}
		& > .byte-size {
			grid-area: size;
			font-size: 0.65em;
			opacity: 0.65;
		}
	}

	.loading {
		opacity: 0.75;
		pointer-events: none;
		user-select: none;
		& > * {
			cursor: progress;
		}
	}

	form {
		background-color: hsl(var(--base-hsl), 50%);
		border-radius: var(--radius);
		padding: var(--span);
	}

	.fields textarea {
		font-size: 1.25em;
		background-color: transparent;
		border: none;

		background-color: hsl(var(--base-hsl), 75%);
	}

	.actions button {
		background-color: hsl(var(--master-hsl), 75%);
	}
`
