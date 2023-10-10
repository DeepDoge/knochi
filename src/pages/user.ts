import { PostFormUI } from "@/components/post-form"
import { ProfileUI } from "@/components/profile"
import { TimelineUI } from "@/components/timeline"
import { commonStyle } from "@/import-styles"
import { routeHash } from "@/router"
import { createLayout } from "@/routes"
import type { Address } from "@/utils/address"
import { Timeline } from "@/utils/timeline"
import { Wallet } from "@/utils/wallet"
import { derive, fragment, isSignal, signal, type Signal } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"
import { match } from "master-ts/extra/match"

const userPageTag = defineCustomTag("x-user-layout-page")
const userPageTopTag = defineCustomTag("x-user-layout-top")
export const userLayout = createLayout<{ userAddress: Address; tab: "posts" | "replies" | "mentions" }>((params) => {
	const bottomRoot = userPageTag()
	const bottomDom = bottomRoot.attachShadow({ mode: "open" })
	bottomDom.adoptedStyleSheets.push(commonStyle, bottomStyle)

	const timeline = match(params.tab)
		.case("posts", () => derive(() => Timeline.create({ author: params.userAddress.ref })))
		.case("replies", () => derive(() => Timeline.create({ author: params.userAddress.ref, replies: "only" })))
		.case("mentions", () => derive(() => Timeline.create({ mention: params.userAddress.ref, replies: "include" })))
		.default()
	// TODO: in master-ts find an elegant solution to this, so we don't have to flatten the signal
	const timelineFlat = derive(() => {
		let signal: Readonly<Signal<unknown>> = timeline
		while (isSignal(signal.ref)) signal = signal.ref
		return signal.ref
	}) as Readonly<Signal<Timeline>>

	const isMyProfile = derive(() => params.userAddress.ref === Wallet.browserWallet.ref?.address)

	bottomDom.append(
		fragment(html` <nav class="tabs">
				<ul>
					<li>
						<a class="btn" class:active=${() => params.tab.ref === "posts"} href=${() => routeHash({ path: `${params.userAddress.ref}/posts` })}>
							Posts
						</a>
					</li>
					<li>
						<a
							class="btn"
							class:active=${() => params.tab.ref === "replies"}
							href=${() => routeHash({ path: `${params.userAddress.ref}/replies` })}>
							Replies
						</a>
					</li>
					<li>
						<a
							class="btn"
							class:active=${() => params.tab.ref === "mentions"}
							href=${() => routeHash({ path: `${params.userAddress.ref}/mentions` })}>
							Mentions
						</a>
					</li>
				</ul>
			</nav>
			${match(isMyProfile)
				.case(true, () => html`${PostFormUI(signal(null))}`)
				.default(() => null)}
			${TimelineUI(timelineFlat)}`)
	)

	const topRoot = userPageTopTag()
	const topDom = topRoot.attachShadow({ mode: "open" })
	topDom.adoptedStyleSheets.push(commonStyle, topStyle)

	topRoot.append(fragment(html` <div class="profile">${ProfileUI(params.userAddress)}</div> `))

	return {
		top: topRoot,
		page: bottomRoot,
	}
})

const topStyle = css`
	.profile {
		font-size: 1.1em;
	}
`

const bottomStyle = css`
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

	.tabs ul li a {
		color: hsl(var(--base-text--hsl), 0.65);
		background-color: hsl(var(--base--hsl));
	}

	.tabs ul li a.active {
		background-color: hsl(var(--primary--hsl), 0.75);
		color: hsl(var(--primary-text--hsl));
	}
`
