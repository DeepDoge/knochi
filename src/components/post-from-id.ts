import { Post } from "@/utils/post"
import type { PostId } from "@/utils/post-id"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { PostUI } from "./post"

const PostFromIdComponent = defineComponent("x-post-from-id")
export function PostFromIdUI(postId: SignalReadable<PostId>) {
	const component = new PostFromIdComponent()

	const post = $.await($.derive(() => Post.getPosts([postId.ref]).then((posts) => posts[0] ?? null), [postId])).then()

	component.$html = html`
		${$.match(post)
			.case(null, () => null)
			.default((post) => PostUI(post))}
	`

	return component
}

PostFromIdComponent.$css = css`
	:host {
		display: contents;
	}
`
