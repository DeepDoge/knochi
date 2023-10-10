import { commonStyle } from "@/import-styles"
import { routeHash } from "@/router"
import type { Post } from "@/utils/post"
import { derive, fragment, type Signal } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"
import { match } from "master-ts/extra/match"

const postIdsTag = defineCustomTag("x-post-ids")
export function PostIdsUI(post: Readonly<Signal<Post>>) {
	const root = postIdsTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const postId = derive(() => post.ref.id)
	const postHref = derive(() => routeHash({ postId: postId.ref }))

	const parentId = derive(() => post.ref.parentId)
	const parentHref = derive(() => routeHash({ postId: parentId.ref }))

	dom.append(
		fragment(html`
			<a class="id post-id" href=${postHref}> ${() => postId.ref.slice(postId.ref.length - 5)} </a>
			${match(derive(() => post.ref.parentId))
				.case(null, () => null)
				.default((parentId) => html`<a class="id parent-id" href=${parentHref}> ${() => parentId.ref.slice(parentId.ref.length - 5)} </a>`)}
		`)
	)

	return root
}

const style = css`
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
