import { CommentSvg } from "@/assets/svgs/comment"
import { RepostSvg } from "@/assets/svgs/repost"
import { routeHash } from "@/router"
import type { Post } from "@/utils/post"
import { PostContent } from "@/utils/post-content"
import { PostId } from "@/utils/post-id"
import { Wallet } from "@/utils/wallet"
import { defineComponent } from "master-ts/library/component"
import { css } from "master-ts/library/template/tags/css"
import { html } from "master-ts/library/template/tags/html"

const PostActionsComponent = defineComponent("x-post-actions")

export type PostAction = {
	svg: SVGElement
	label: string
	text: string | null
	colorStyle: string
	action: Function | string
}

export function PostActionsUI(post: Post) {
	const component = new PostActionsComponent()

	async function repost() {
		const bytes = PostContent.encode([
			{
				type: "echo",
				value: PostId.toUint8Array(post.id),
			},
		])
		await Wallet.browserWallet.ref?.contracts.EternisPost.post(bytes)
	}

	const postActions = [
		{
			svg: CommentSvg(),
			label: "Reply",
			text: post.replyCount ? post.replyCount.toString() : null,
			colorHsl: "var(--accent--hsl)",
			action: routeHash({ postId: post.id }),
		},
		{
			svg: RepostSvg(),
			label: "Repost",
			text: null,
			colorHsl: "var(--second--hsl)",
			action: repost,
		},
	]

	component.$html = html`
		${postActions.map((postAction) => {
			if (typeof postAction.action === "string")
				return html`
					<a class="ghost" href=${postAction.action} title=${postAction.label} style:--color--hsl=${postAction.colorHsl}>
						<x ${postAction.svg} aria-label=${postAction.label}></x>
						${postAction.text}
					</a>
				`
			else
				return html`
					<button class="ghost" on:click=${postAction.action} title=${postAction.label} style:--color--hsl=${postAction.colorHsl}>
						<x ${postAction.svg} aria-label=${postAction.label}></x>
						${postAction.text}
					</button>
				`
		})}
	`

	return component
}

PostActionsComponent.$css = css`
	:host {
		display: grid;
		grid-auto-flow: column;
		gap: calc(var(--span) * 1);
		align-items: center;
		color: ;
	}

	:host > * {
		display: grid;
		grid-template-columns: 2.25em auto;
		gap: calc(var(--span) * 0.5);
		align-items: center;
		color: inherit;
		font: inherit;
		cursor: pointer;

		&:hover {
			text-decoration: none;
		}

		& > svg {
			border-radius: var(--radius-fab);
			padding: calc(var(--span) * 0.5);
		}
	}

	:host > * {
		&:hover,
		&:focus-visible {
			color: hsl(var(--color--hsl));

			& > svg {
				background-color: hsl(var(--color--hsl), 0.1);
			}
		}
	}
`
