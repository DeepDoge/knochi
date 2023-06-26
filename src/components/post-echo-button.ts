import { wallet } from "@/api/wallet"
import type { Post } from "@/utils/post"
import { PostContent } from "@/utils/post-content"
import { PostId } from "@/utils/post-id"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { html } from "master-ts/library/template"

const PostEchoButtonComponent = defineComponent("x-post-echo-button")
export function PostEchoButton(post: SignalReadable<Post>) {
	const component = new PostEchoButtonComponent()

	async function echoPost() {
		const bytes = PostContent.encode([
			{
				type: "echo",
				value: PostId.toUint8Array(post.ref.id),
			},
		])
		await wallet.browserWallet.ref?.contracts.EternisPostDB.post(bytes)
	}

	component.$html = html` <button on:click=${() => echoPost()}>Echo</button> `

	return component
}
