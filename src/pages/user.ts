import { theGraphApi } from "@/api/graph"
import { wallet } from "@/api/wallet"
import { PostForm } from "@/components/post-form"
import { Profile } from "@/components/profile"
import { Timeline } from "@/components/timeline"
import { routeHref } from "@/router"
import { createLayout } from "@/routes"
import type { Address } from "@/utils/address"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

export const userLayout = createLayout<{ userAddress: Address; tab: "posts" | "replies" | "mentions" }>((params) => {
	const PageComponent = defineComponent("x-user-layout-page")
	PageComponent.$css = css`
		:host {
			display: grid;
			gap: calc(var(--span) * 2);
		}

		.tabs ul {
			list-style: none;
			padding: 0;

			display: grid;
			grid-auto-flow: column;
			gap: calc(var(--span) * 0.5);
		}

		.tabs ul li {
			display: grid;
		}

		.tabs ul li a.active {
			background-color: hsl(var(--primary--hsl), 75%);
			color: hsl(var(--primary--text-hsl));
		}
	`

	const page = new PageComponent()
	const timeline = $.flatten(
		$.match(params.tab)
			.case("posts", () => $.derive(() => theGraphApi.createTimeline({ author: params.userAddress.ref })))
			.case("replies", () => $.derive(() => theGraphApi.createTimeline({ author: params.userAddress.ref, replies: "only" })))
			.case("mentions", () => $.derive(() => theGraphApi.createTimeline({ mention: params.userAddress.ref, replies: "include" })))
			.default()
	)

	const isMyProfile = $.derive(() => params.userAddress.ref === wallet.browserWallet.ref?.address)

	page.$html = html` <nav class="tabs">
			<ul>
				<li>
					<a class="btn" class:active=${() => params.tab.ref === "posts"} href=${() => routeHref({ path: `${params.userAddress.ref}/posts` })}>
						Posts
					</a>
				</li>
				<li>
					<a class="btn" class:active=${() => params.tab.ref === "replies"} href=${() => routeHref({ path: `${params.userAddress.ref}/replies` })}>
						Replies
					</a>
				</li>
				<li>
					<a class="btn" class:active=${() => params.tab.ref === "mentions"} href=${() => routeHref({ path: `${params.userAddress.ref}/mentions` })}>
						Mentions
					</a>
				</li>
			</ul>
		</nav>
		${$.match(isMyProfile)
			.case(true, () => html`${PostForm($.writable(null))}`)
			.default(() => null)}
		${Timeline(timeline)}`

	const TopComponent = defineComponent("x-user-layout-top")
	const top = new TopComponent()
	TopComponent.$css = css`
		.profile {
			font-size: 1.1em;
		}
	`
	top.$html = html` <div class="profile">${Profile(params.userAddress)}</div> `

	return {
		top,
		page,
	}
})
