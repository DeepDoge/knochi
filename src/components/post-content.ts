import { ProfileNameUI } from "@/components/profile-name"
import { Address } from "@/utils/address"
import type { Post } from "@/utils/post"
import { PostId } from "@/utils/post-id"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css } from "master-ts/library/template/tags/css"
import { html } from "master-ts/library/template/tags/html"
import { PostFromIdUI } from "./post-from-id"

const PostContentComponent = defineComponent("x-post-content")
export function PostContentUI(post: SignalReadable<Post>) {
	const component = new PostContentComponent()

	const postContents = $.derive(() => post.ref.contents)

	component.$html = html`
		${$.each(postContents).as((content) =>
			$.switch(content)
				// Using async to catch errors
				.match({ type: "text" }, () => html`<span>${$.await($.derive(async () => ethers.toUtf8String(content.ref.value))).then()}</span>`)
				.match({ type: "@" }, () =>
					$.await($.derive(async () => Address.from(ethers.toUtf8String(content.ref.value)))).then((address) => ProfileNameUI(address))
				)
				.match({ type: "echo" }, () =>
					$.await($.derive(async () => PostId.fromUint8Array(content.ref.value))).then((postId) =>
						$.switch(postId)
							.match(post.ref.id, () => null)
							.default((postId) => PostFromIdUI(postId, null))
					)
				)
				.default(() => null)
		)}
	`

	return component
}

PostContentComponent.$css = css`
	:host {
		font-size: 1.1em;

		display: flex;
		gap: 0.5ch;
		flex-wrap: wrap;
		align-items: center;
		justify-content: start;
	}
`
