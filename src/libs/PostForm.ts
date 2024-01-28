import { globalSheet } from "@/styles"
import { EternisPost_connect } from "@/utils/contracts/EternisPost"
import { Post, encodePost } from "@/utils/post"
import { uniqueId } from "@/utils/unique"
import { getSigner } from "@/utils/wallet"
import {
	css,
	customTag,
	derive,
	populate,
	sheet,
	signal,
	tags,
} from "cherry-ts"

const { form, div, textarea, button, small } = tags

const postFormTag = customTag("x-post-form")
export function PostForm() {
	const root = postFormTag({ role: "form" })
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(globalSheet, postFormSheet)

	const text = signal("")
	const textEncoded = derive(() =>
		encodePost([{ type: Post.Content.TypeMap.Text, value: text.ref }]),
	)

	const postForm = form({
		hidden: "",
		id: uniqueId("post-form"),
		async "on:submit"(event) {
			event.preventDefault()

			const signer = await getSigner()
			const contract = EternisPost_connect(signer)

			const tx = await contract.post(textEncoded.ref)
		},
	})

	// TODO: Let's start basic with text only. Later add other stuff.
	populate(dom, [
		postForm,
		div({ class: "fields" }, [
			div({ class: "field" }, [
				textarea({
					form: postForm.id,
					name: "content",
					required: "",
					class: "input",
					"aria-label": "Post content",
					placeholder: "Just say it...",
					"bind:value": text,
					"on:input"(event) {
						const textarea = event.currentTarget
						textarea.style.height = "auto"
						textarea.style.height = `calc(calc(${textarea.scrollHeight}px - 1em))`
					},
				}),
				small([() => textEncoded.ref.byteLength, " bytes"]),
			]),
		]),
		div({ class: "actions" }, [
			button({ form: postForm.id, type: "submit", class: "button" }, [
				"Post",
			]),
		]),
	])

	return root
}

const postFormSheet = sheet(css`
	:host {
		display: grid;
		gap: 1em;
	}

	.fields {
		display: grid;
		gap: 1em;
	}

	.field {
		display: grid;
		gap: 0.25em;

		& small {
			justify-self: end;
		}
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		justify-content: end;
		gap: 1em;
	}

	textarea {
		resize: none;
		min-height: 2em;
		font-size: 1.25em;
		overflow-x: hidden;
		word-break: break-word;
	}
`)
