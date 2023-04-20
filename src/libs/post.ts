import type { PostData } from "@/api/graph"
import { networks } from "@/api/networks"
import { routeHref } from "@/route"
import { relativeTimeSignal } from "@/utils/time"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal/readable"
import { css, html } from "master-ts/library/template"
import { WalletAddress } from "./wallet-address"

const PostComponent = defineComponent("x-post")
export function Post(post: SignalReadable<PostData>) {
	const component = new PostComponent()

	const textContents = $.derive(() => {
		let text = post.ref.contents
			.filter((content) => content.type === "text")
			.map((content) => ethers.utils.toUtf8String(content.value))
			.join("\n")
			.trim()
		if (text.length > 128) text = `${text.substring(0, 128).trimEnd()}...`
		return text.split("\n")
	})

	component.$html = html`
		<div class="glow-effect"></div>
		<div class="header">
			<div class="author">${WalletAddress($.derive(() => post.ref.author))}</div>
			<div class="chips">
				<span class="chain" title=${() => networks.chains[post.ref.chainKey].name}>${() => networks.chains[post.ref.chainKey].name}</span>
				<a class="post-id" href=${() => routeHref({ postId: post.ref.id })}>${() => post.ref.id}</a>
				<a class="parent-id" href=${routeHref({ postId: post.ref.parentId })}>${() => post.ref.parentId}</a>
			</div>
		</div>
		<div class="content">${() => textContents.ref.map((textContent) => html` <div>${textContent}</div> `)}</div>
		<div class="footer">
			<div class="reply-count">Replies: ${() => post.ref.replyCount}</div>
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
		padding: calc(var(--span) * 1);

		background-color: hsl(var(--base-hsl));
		color: hsl(var(--base-text-hsl));

		border-radius: var(--radius);
		border: calc(var(--span) * 0.1) solid hsl(var(--master-hsl), 25%);
	}

	.glow-effect {
		position: absolute;
		inset: 0;
		z-index: -1;

		border-radius: inherit;
		background-color: hsl(var(--master-hsl), 25%);
		filter: blur(1rem);
	}

	.header {
		display: grid;
		grid-auto-flow: column;
		gap: calc(var(--span) * 0.5);
		align-items: center;
		justify-content: space-between;
		font-size: 0.75em;
	}

	.chips {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 0.5em;

		& > a::before {
			content: "@";
		}
		& > * {
			display: block;
			padding: calc(var(--span) * 0) calc(var(--span) * 0.5);
			border-radius: var(--radius);

			&:empty {
				display: none;
			}
			&.chain {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			&.post-id {
				color: hsl(var(--slave-text-hsl));
				background-color: hsl(var(--slave-hsl), 50%);
			}
			&.parent-id {
				color: hsl(var(--master-text-hsl));
				background-color: hsl(var(--master-hsl), 50%);
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

		/* 		& > * + *::before {
			content: "·"
		} */
	}
`
