import { ProfileUI } from "@/components/profile"
import { Networks } from "@/networks"
import { routeHash } from "@/router"
import type { Post } from "@/utils/post"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"

const PostHeaderComponent = defineComponent("x-post-header")
export function PostHeaderUI(post: SignalReadable<Post>) {
	const component = new PostHeaderComponent()

	const postHref = $.derive(() => routeHash({ postId: post.ref.id }))
	const parentHref = $.derive(() => routeHash({ postId: post.ref.parentId }))

	component.$html = html`
		<x ${ProfileUI($.derive(() => post.ref.author))} class="author"></x>

		<span class="chain" title=${() => Networks.chains[post.ref.chainKey].name}> ${() => Networks.chains[post.ref.chainKey].name} </span>

		<div class="ids">
			<a class="id post-id" href=${postHref}> ${() => post.ref.id.slice(post.ref.id.length - 5)} </a>
			${$.match($.derive(() => post.ref.parentId))
				.case(null, () => null)
				.default((parentId) => html`<a class="id parent-id" href=${parentHref}> ${() => parentId.ref.slice(parentId.ref.length - 5)} </a>`)}
		</div>
	`

	return component
}

PostHeaderComponent.$css = css`
	:host {
		display: grid;

		grid-template-areas:
			"author ids"
			"author chain";
		grid-template-columns: auto 1fr;

		align-items: center;
		justify-items: end;
		gap: calc(var(--span) * 0.25);

		font-size: 0.75em;
	}

	.author {
		grid-area: author;
		font-size: 0.95em;
	}

	.chain {
		grid-area: chain;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ids {
		grid-area: ids;
		display: grid;
		grid-auto-flow: column;
		gap: calc(var(--span) * 0.25);
		align-items: center;

		.id {
			padding: 0.25em 0.5em;
			border-radius: var(--radius);
			font-size: 0.75em;

			&::before {
				content: "@";
			}
		}
		.post-id {
			color: hsl(var(--second--text-hsl));
			background-color: hsl(var(--second--hsl), 75%);
		}
		.parent-id {
			color: hsl(var(--accent--text-hsl));
			background-color: hsl(var(--accent--hsl), 75%);
		}
	}
`
