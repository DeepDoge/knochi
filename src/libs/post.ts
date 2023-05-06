import type { TheGraphApi } from "@/api/graph"
import { NetworkConfigs } from "@/api/network-config"
import { CommentSvg } from "@/assets/svgs/comment"
import { Profile } from "@/libs/profile"
import { ProfileName } from "@/libs/profile-name"
import { route, routeHref } from "@/router"
import { Address } from "@/utils/address"
import { relativeTimeSignal } from "@/utils/time"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"

const PostComponent = defineComponent("x-post")
export function Post(post: SignalReadable<TheGraphApi.Post>) {
	const component = new PostComponent()

	const postContents = $.derive(() => post.ref.contents)

	const postHref = $.derive(() => routeHref({ postId: post.ref.id }))
	const parentHref = $.derive(() => routeHref({ postId: post.ref.parentId }))

	component.$html = html`
		<div class="post" class:active=${() => route.postId.ref === post.ref.id}>
			<div class="glow-effect"></div>
			<div class="header">
				<x ${Profile($.derive(() => post.ref.author))} class="author"></x>
				<div class="chips">
					<span class="chain" title=${() => NetworkConfigs.chains[post.ref.chainKey].name}>
						${() => NetworkConfigs.chains[post.ref.chainKey].name}
					</span>
					<a class="id post-id" href=${postHref}> ${() => post.ref.id.slice(post.ref.id.length - 5)} </a>
					${$.match($.derive(() => post.ref.parentId))
						.case(null, () => null)
						.default((parentId) => html`<a class="id parent-id" href=${parentHref}> ${() => parentId.ref.slice(parentId.ref.length - 5)} </a>`)}
				</div>
			</div>
			<div class="content">
				<a href=${postHref} class="backdrop-link"></a>
				${$.each(postContents)
					.key((_, index) => index)
					.as((content) =>
						$.match($.derive(() => content.ref.type))
							.case("text", () => html`<a href=${postHref}>${() => ethers.toUtf8String(content.ref.value)}</a>`)
							.case("mention", () => {
								try {
									return ProfileName($.derive(() => Address(ethers.toUtf8String(content.ref.value))))
								} catch (error) {
									return null
								}
							})
							.default(() => null)
					)}
			</div>
			<div class="footer">
				<a class="reply-count" href=${postHref}>${() => CommentSvg()} ${() => "TODO"}</a>
				<a class="created-at" href=${postHref}>${() => relativeTimeSignal(post.ref.createdAt)}</a>
			</div>
		</div>
	`

	return component
}

PostComponent.$css = css`
	:host {
		display: contents;
	}

	.post {
		position: relative;
		display: grid;
		gap: calc(var(--span) * 0.5);
		padding: calc(var(--span) * 0.75) calc(var(--span) * 0.75);

		background-color: hsl(var(--base-hsl));
		color: hsl(var(--base-text-hsl));

		border-radius: var(--radius);
		border: calc(var(--span) * 0.1) solid hsl(var(--master-hsl), 25%);

		&.active {
			border-color: hsl(var(--slave-hsl));
		}
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

			&.chain {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			&.post-id {
				color: hsl(var(--slave-text-hsl));
				background-color: hsl(var(--slave-hsl), 75%);
			}
			&.parent-id {
				color: hsl(var(--master-text-hsl));
				background-color: hsl(var(--master-hsl), 75%);
			}
		}
	}

	.content {
		position: relative;
		isolation: isolate;
		font-size: 1.1em;

		& > .backdrop-link {
			position: absolute;
			inset: 0;
			z-index: -1;
		}
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
