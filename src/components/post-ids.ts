import { routeHash } from "@/router"
import type { Post } from "@/utils/post"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"

const PostIdsComponent = defineComponent("x-post-ids")
export function PostIdsUI(post: SignalReadable<Post>) {
	const component = new PostIdsComponent()

	const postId = $.derive(() => post.ref.id)
	const postHref = $.derive(() => routeHash({ postId: postId.ref }))

	const parentId = $.derive(() => post.ref.parentId)
	const parentHref = $.derive(() => routeHash({ postId: parentId.ref }))

	component.$html = html`
		<a class="id post-id" href=${postHref}> ${() => postId.ref.slice(postId.ref.length - 5)} </a>
		${$.match($.derive(() => post.ref.parentId))
			.case(null, () => null)
			.default((parentId) => html`<a class="id parent-id" href=${parentHref}> ${() => parentId.ref.slice(parentId.ref.length - 5)} </a>`)}
	`

	return component
}

PostIdsComponent.$css = css`
	:host {
		display: grid;
		grid-auto-flow: column;
		gap: calc(var(--span) * 0.5);
		font-size: 0.8em;
		align-items: center;
	}

	.id {
		padding: 0.125em 0.5em;
		border-radius: var(--radius);

		&::before {
			content: "@";
		}
	}
	.post-id {
		color: hsl(var(--second-text--hsl), 0.65);
		background-color: hsl(var(--second--hsl), 0.25);
	}
	.parent-id {
		color: hsl(var(--accent-text--hsl), 0.65);
		background-color: hsl(var(--accent--hsl), 0.25);
	}
`
