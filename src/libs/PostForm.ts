import { globalSheet } from "@/styles"
import { EternisPost_connect } from "@/utils/contracts/EternisPost"
import { Post, encodePost } from "@/utils/post"
import { uniqueId } from "@/utils/unique"
import { getSigner } from "@/utils/wallet"
import { css, customTag, populate, sheet, tags } from "cherry-ts"

const { form, div, textarea, input, button } = tags

const postFormTag = customTag("x-post-form")
export function PostForm() {
	const root = postFormTag({ role: "form" })
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(globalSheet, postFormSheet)

	async function onSubmit(
		event: SubmitEvent & { currentTarget: HTMLFormElement },
	) {
		event.preventDefault()
		const form = event.currentTarget
		const formData = new FormData(form)
		const content = formData.get("content")
		if (typeof content !== "string") throw new Error()

		const signer = await getSigner()
		const contract = EternisPost_connect(signer)

		const encoded = encodePost([
			{ type: Post.Content.TypeMap.text, value: content },
		])
		const tx = await contract.post(encoded)
	}

	const postForm = form({
		hidden: "",
		id: uniqueId("post-form"),
		"on:submit": onSubmit,
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
				}),
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
		gap: 1em;
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		justify-content: end;
		gap: 1em;
	}
`)
