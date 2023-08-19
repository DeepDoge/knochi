import { Post } from "@/utils/post"
import type { PostId } from "@/utils/post-id"
import type { Call, Tuples } from "hotscript"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { PostUI } from "./post"

const PostFromIdComponent = defineComponent("x-post-from-id")
export function PostFromIdUI(postId: SignalReadable<PostId>, ...args: Call<Tuples.Drop<1>, Parameters<typeof PostUI>>) {
	const component = new PostFromIdComponent()

	const post = $.await($.derive(() => Post.getPosts([postId.ref]).then((posts) => posts[0] ?? null), [postId])).then()

	component.$html = html`
		${$.switch(post)
			.match(null, () => null)
			.default((post) => PostUI(post, ...args))}
	`

	return component
}

PostFromIdComponent.$css = css`
	:host {
		display: contents;
	}
`
