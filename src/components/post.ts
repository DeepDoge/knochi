import { RepostSvg } from "@/assets/svgs/repost"
import { ProfileNameUI } from "@/components/profile-name"
import { Networks } from "@/networks"
import { route, routeHash } from "@/router"
import type { Address } from "@/utils/address"
import type { Post } from "@/utils/post"
import { PostId } from "@/utils/post-id"
import { relativeTimeSignal } from "@/utils/time"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { PostActionsUI } from "./post-actions"
import { PostContentUI } from "./post-content"
import { PostFromIdUI } from "./post-from-id"
import { ProfileAddressUI } from "./profile-address"
import { ProfileAvatarUI } from "./profile-avatar"

const PostComponent = defineComponent("x-post")
export function PostUI(post: SignalReadable<Post>, reposterAddress: SignalReadable<Address | null> | null) {
	const component = new PostComponent()

	const postId = $.derive(() => post.ref.id)
	const postContents = $.derive(() => post.ref.contents)
	const postAuthor = $.derive(() => post.ref.author)
	const postHref = $.derive(() => routeHash({ postId: postId.ref }))

	const repostedPostId = $.derive(() =>
		postContents.ref.length === 1 && postContents.ref[0]!.type === "echo" ? PostId.fromUint8Array(postContents.ref[0]!.value) : null
	)

	component.$html = html`
		${$.match(repostedPostId)
			.case(
				null,
				() => html`
					<div
						class="post"
						class:is-repost=${() => !!(reposterAddress && reposterAddress.ref)}
						class:active=${() => route.postId.ref === postId.ref}
						on:click=${() => (location.hash = postHref.ref)}
						style:cursor=${() => (route.postId.ref === postId.ref ? "default" : "pointer")}>
						<x ${RepostSvg()} class="repost-icon" style:grid-area=${"repost-icon"}></x>
						<span class="repost-text" style:grid-area=${"repost-text"}>
							<a href=${() => reposterAddress?.ref && routeHash({ path: reposterAddress.ref })}>${reposterAddress}</a> reposted
						</span>

						<x ${ProfileAvatarUI(postAuthor)} class="avatar" style:grid-area=${"avatar"}></x>
						<x ${ProfileNameUI(postAuthor)} class="name" style:grid-area=${"name"}></x>
						<x ${ProfileAddressUI(postAuthor)} class="address" style:grid-area=${"address"}></x>

						<span class="chain" style:grid-area=${"chain"} title=${() => Networks.chains[post.ref.chainKey].name}>
							${() => Networks.chains[post.ref.chainKey].name}
						</span>

						<x ${PostContentUI(post)} class="content" style:grid-area=${"content"}></x>

						${() => html`<x ${PostActionsUI(post.ref)} class="actions" style:grid-area=${"actions"}></x>`}
						<a class="date" style:grid-area=${"date"} href=${postHref}>${() => relativeTimeSignal(post.ref.createdAt)}</a>
					</div>
				`
			)
			.default((repostedPostId) => PostFromIdUI(repostedPostId, postAuthor))}
	`

	return component
}

PostComponent.$css = css`
	:host {
		display: contents;
		font-size: 1rem;
	}

	.post {
		background-color: hsl(var(--base--hsl), 0.75);
		padding: calc(var(--span) * 0.5);
		border-radius: var(--radius);
	}

	.post {
		display: grid;
		grid-template-areas:
			"repost-icon 	. repost-text 	repost-text 	chain"
			". 				. . 			. 				chain"
			"avatar 		. name 			name 			chain"
			"avatar 		. . 			.				chain"
			"avatar 		. address		. 				chain"
			"avatar 		. . 			.				."
			"avatar 		. content		content			content"
			"avatar 		. . 			. 				."
			"avatar			. actions		.				date";

		& > .ids,
		& > .chain,
		& > .date {
			justify-self: end;
		}
		& > .actions {
			justify-self: start;
		}

		grid-template-columns: 1.75em calc(var(--span) * 0.5) 1fr calc(var(--span) * 0.5) auto;
		grid-template-rows: auto calc(var(--span) * 0.25) auto 0 auto calc(var(--span) * 0.5) auto calc(var(--span) * 0.5) auto;
	}

	.date,
	.address,
	.chain,
	.actions,
	.repost-text,
	.repost-icon {
		color: hsl(var(--base-text--hsl), 0.65);
	}

	.name {
		font-size: 0.8em;
	}

	.date,
	.address,
	.chain,
	.actions,
	.repost-text {
		font-size: 0.7em;
	}

	.chain {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.repost-icon {
		width: 0.75em;
		justify-self: end;
	}

	.post:not(.is-repost) {
		.repost-icon,
		.repost-text {
			display: none;
		}
	}
`
