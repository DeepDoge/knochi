import { ProfileNameUI } from "@/components/profile-name"
import { route, routeHash } from "@/router"
import { Address } from "@/utils/address"
import type { Post } from "@/utils/post"
import { PostId } from "@/utils/post-id"
import { relativeTimeSignal } from "@/utils/time"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { PostFromIdUI } from "./post-from-id"
import { PostHeaderUI } from "./post-header"
import { PostActionsUI } from "./post.actions"
import { RepostUI } from "./repost"

const PostComponent = defineComponent("x-post")
export function PostUI(post: SignalReadable<Post>) {
	const component = new PostComponent()

	const postContents = $.derive(() => post.ref.contents)

	const echoOnly = $.derive(() => (postContents.ref.length === 1 && postContents.ref[0]!.type === "echo" ? postContents.ref[0]!.value : null))

	const postHref = $.derive(() => routeHash({ postId: post.ref.id }))

	component.$html = html`
		${$.match(echoOnly)
			.case(
				null,
				() => html`
					<div class="post" class:active=${() => route.postId.ref === post.ref.id}>
						<a href=${postHref} aria-label="Go to the ${() => post.ref.id}" class="btn-glass backdrop-link"></a>
						${PostHeaderUI(post)}
						<div class="content">
							${$.each(postContents).as((content) =>
								$.match($.derive(() => content.ref.type))
									// Using async to catch errors
									.case("text", () => html`<span>${$.await($.derive(async () => ethers.toUtf8String(content.ref.value)))}</span>`)
									.case("@", () =>
										$.await($.derive(async () => Address.from(ethers.toUtf8String(content.ref.value)))).then((address) =>
											ProfileNameUI(address)
										)
									)
									.case("echo", () =>
										$.await($.derive(async () => PostId.fromUint8Array(content.ref.value))).then((postId) =>
											$.match(postId)
												.case(post.ref.id, () => null)
												.default((postId) => PostFromIdUI(postId))
										)
									)
									.default(() => null)
							)}
						</div>
						<div class="footer">
							${() => PostActionsUI(post.ref)}
							<a class="created-at" href=${postHref}>${() => relativeTimeSignal(post.ref.createdAt)}</a>
						</div>
					</div>
				`
			)
			.default((echo) => RepostUI($.derive(() => ({ postId: PostId.fromUint8Array(echo.ref), authorAddress: post.ref.author }))))}
	`

	return component
}

PostComponent.$css = css`
	:host {
		display: contents;
		font-size: 1rem;

		--glass-color--alpha: 1%;
	}

	.post {
		position: relative;
		width: 100%;

		display: grid;
		gap: calc(var(--span) * 0.5);
		padding: calc(var(--span) * 0.75) calc(var(--span) * 0.75);

		background-color: hsl(var(--base--hsl), 0.5);
		color: hsl(var(--base--text-hsl));

		border-radius: var(--radius);
		border: calc(var(--span) * 0.1) solid transparent;

		&.active {
			border-color: hsl(var(--second--hsl));
		}

		isolation: isolate;
		contain: paint;
		& > :not(.backdrop-link) {
			pointer-events: none;
			&:not(.content) > * {
				pointer-events: all;
			}
		}
		& > .backdrop-link {
			position: absolute;
			inset: 0;
			z-index: -1;
		}
	}

	.content {
		font-size: 1.1em;

		display: flex;
		gap: 0.5ch;
		flex-wrap: wrap;
		align-items: center;
		justify-content: start;
	}

	.footer {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--span) * 0.5);
		font-size: 0.75em;

		align-items: center;
		justify-content: space-between;
	}
`
