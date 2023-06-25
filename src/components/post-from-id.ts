import { TheGraphApi } from "@/api/graph"
import { Post } from "@/components/post"
import type { PostId } from "@/utils/post-id"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"

const PostFromIdComponent = defineComponent("x-post-from-id")
export function PostFromId(postId: SignalReadable<PostId>) {
	const component = new PostFromIdComponent()

	const post = $.await($.derive(() => TheGraphApi.getPosts([postId.ref]).then((posts) => posts[0] ?? null), [postId])).then()

	component.$html = html`
		${$.match(post)
			.case(null, () => null)
			.default((post) => Post(post))}
	`

	return component
}

PostFromIdComponent.$css = css`
	:host {
		display: contents;
	}
`
