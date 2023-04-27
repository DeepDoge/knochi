import type { PostData } from "@/api/graph"
import { networks } from "@/api/networks"
import { CommentSvg } from "@/assets/svgs/comment"
import { routeHref } from "@/route"
import { relativeTimeSignal } from "@/utils/time"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { Profile } from "@/libs/profile"
import { GlowEffect } from "./effects/glow"

const PostComponent = defineComponent("x-post")
export function Post(post: SignalReadable<PostData>) {
	const component = new PostComponent()

	let text = post.ref.contents
		.filter((content) => content.type === "text")
		.map((content) => ethers.utils.toUtf8String(content.value))
		.join("\n")
		.trim()
	if (text.length > 128) text = `${text.substring(0, 128).trimEnd()}...`
	const textContents = text.split("\n")

	component.$html = html`
		${GlowEffect()}
		<div class="header">
			<x ${Profile($.derive(() => post.ref.author))} class="author"></x>
			<div class="chips">
				<span class="chain" title=${() => networks.chains[post.ref.chainKey].name}>
					${networks.chains[post.ref.chainKey].name}
				</span>
				<a class="id post-id" href=${() => routeHref({ postId: post.ref.id })}>${post.ref.id.toString().slice(0, 8)}</a>
				<a class="id parent-id" href=${() => routeHref({ postId: post.ref.parentId })}
					>${post.ref.parentId && "parent"}</a
				>
			</div>
		</div>
		<a class="content" href=${() => routeHref({ postId: post.ref.id })}
			>${textContents.map((textContent) => html` <div>${textContent}</div> `)}</a
		>
		<div class="footer">
			<div class="reply-count">${() => CommentSvg()} ${post.ref.replyCount.toString()}</div>
			<div class="created-at">${() => relativeTimeSignal(post.ref.createdAt)}</div>
		</div>
	`

	return component
}

PostComponent.$css = css`
	:host {
		position: relative;
		display: grid;
		gap: calc(var(--span) * 0.5);
		padding: calc(var(--span) * 0.75) calc(var(--span) * 0.75);

		background-color: hsl(var(--base-hsl));
		color: hsl(var(--base-text-hsl));

		border-radius: var(--radius);
		border: calc(var(--span) * 0.1) solid hsl(var(--master-hsl), 25%);
	}

	.header {
		display: grid;
		grid-auto-flow: column;
		gap: calc(var(--span) * 0.5);
		align-items: center;
		justify-content: space-between;
		font-size: 0.75em;
	}

	.author {
		font-size: 0.95em;
	}

	.chips {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 0.5em;

		& > a {
			padding: calc(var(--span) * 0) calc(var(--span) * 0.5);

			&::before {
				content: "@";
			}
		}
		& > * {
			display: block;
			border-radius: var(--radius);

			&:empty {
				display: none;
			}
			&.chain {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			&.id {
				color: hsl(var(--slave-text-hsl));
				background-color: hsl(var(--slave-hsl), 75%);
			}
		}
	}

	.content {
		font-size: 1.1em;
	}

	.footer {
		display: flex;
		gap: calc(var(--span) * 0.5);
		font-size: 0.7em;

		align-items: center;
		justify-content: space-between;

		& .reply-count {
			display: grid;
			grid-template-columns: 1.25em auto;
			gap: calc(var(--span) * 0.25);
			justify-content: start;
			align-items: center;
		}
	}
`
