import { ProfileNameUI } from "@/components/profile-name"
import { Address } from "@/utils/address"
import type { Post } from "@/utils/post"
import { PostId } from "@/utils/post-id"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { PostFromIdUI } from "./post-from-id"

const PostContentComponent = defineComponent("x-post-content")
export function PostContentUI(post: SignalReadable<Post>) {
	const component = new PostContentComponent()

	const postContents = $.derive(() => post.ref.contents)

	component.$html = html`
		${$.each(postContents).as((content) =>
			$.match($.derive(() => content.ref.type))
				// Using async to catch errors
				.case("text", () => html`<span>${$.await($.derive(async () => ethers.toUtf8String(content.ref.value)))}</span>`)
				.case("@", () => $.await($.derive(async () => Address.from(ethers.toUtf8String(content.ref.value)))).then((address) => ProfileNameUI(address)))
				.case("echo", () =>
					$.await($.derive(async () => PostId.fromUint8Array(content.ref.value))).then((postId) =>
						$.match(postId)
							.case(postId.ref, () => null)
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
