import { getTimeline } from "@/api/graph"
import { Profile } from "@/libs/profile"
import { Timeline } from "@/libs/timeline"
import { createLayout } from "@/router"
import type { Address } from "@/utils/address"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

export const userLayout = createLayout<{ userAddress: Address }>((params) => {
	const PageComponent = defineComponent("x-user-layout-page")
	const page = new PageComponent()
	const timeline = $.derive(() => getTimeline({ author: params.ref.userAddress }))
	PageComponent.$css = css`
		:host {
			display: grid;
			gap: var(--span);
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
	`
	page.$html = html` <nav class="tabs">
			<ul>
				<li>
					<a class="btn link" href="">Posts</a>
				</li>
				<li>
					<a class="btn link" href="">Replies</a>
				</li>
				<li>
					<a class="btn link" href="">Mentions</a>
				</li>
			</ul>
		</nav>
		${Timeline(timeline)}`

	const TopComponent = defineComponent("x-user-layout-top")
	const top = new TopComponent()
	TopComponent.$css = css`
		.profile {
			font-size: 1.1em;
		}
	`
	top.$html = html` <div class="profile">${() => Profile(params.ref.userAddress)}</div> `

	return {
		top,
		page,
	}
})
