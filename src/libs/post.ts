import { PostData } from "@/api/graph"
import { routeHref } from "@/route"
import { secondTick } from "@/utils/ticks"
import { relativeTime } from "@/utils/time"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { SignalReadable } from "master-ts/library/signal/readable"
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
			<div class="author">
				${() => WalletAddress(post.ref.author)}
			</div>
			<div class="chips">
				<a class="post-id" href=${() => routeHref({ postId: post.ref.id })}>${() => post.ref.id}</a>
				<a class="parent-id" href=${routeHref({ postId: post.ref.parentId })}>${() => post.ref.parentId}</a>
			</div>
		</div>
		<div class="content">
			${() =>
				textContents.ref.map(
					(textContent) => html`
						<div>${textContent}</div>
					`
				)}
		</div>
		<div class="footer">
			<div class="reply-count">
				Replies: ${() => post.ref.replyCount}
			</div>
			<div class="created-at">
				${$.derive(() => relativeTime(post.ref.createdAt), [secondTick, post])}
			</div>
		</div>
	`

	return component
}

PostComponent.$css = css`
	:host {
		position: relative;
		display: grid;
		gap: calc(var(--span) * 0.5);
		background-color: hsl(var(--base-hsl), 50%);
		color: hsl(var(--base-text-hsl));
		padding: calc(var(--span) * 1);
		border-radius: var(--radius);
		border: 1px solid hsl(var(--base-hsl));
	}

	.glow-effect {
		position: absolute;
		inset: 0;
		background-color: hsl(var(--master-hsl), 20%);
		color: hsl(var(--master-text-hsl));
		z-index: -1;
		border-radius: inherit;
		filter: blur(1rem);
	}

	.header {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--span) * 0.5);
		align-items: center;
		justify-content: space-between;
		font-size: 0.75em;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5em;

		& > * {
			display: grid;
			grid-auto-flow: column;
			place-items: center;
			padding: calc(var(--span) * 0) calc(var(--span) * 0.5);
			border-radius: var(--radius);

			&::before {
				content: "@";
			}
			&:empty {
				display: none;
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
