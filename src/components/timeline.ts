import { commonStyle } from "@/import-styles"
import type { Timeline } from "@/utils/timeline"
import { derive, fragment, type Signal } from "master-ts/core"
import { awaited } from "master-ts/extra/awaited"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { each } from "master-ts/extra/each"
import { html } from "master-ts/extra/html"
import { PostUI } from "./post"

const timelineTag = defineCustomTag("x-timeline")
export function TimelineUI(timeline: Readonly<Signal<Timeline>>) {
	const root = timelineTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const loadBottomButtonObserve = new IntersectionObserver((entries) => {
		if (!entries[0] || entries[0].intersectionRatio <= 0) return
		timeline.ref.loadBottom()
	})

	const loading = derive(() => timeline.ref.loading.ref)

	const loadBottomButton = html`
		<button class="btn load-more" disabled=${() => (loading.ref ? "" : null)} on:click=${() => timeline.ref.loadBottom()}>
			${() => (loading.ref ? "Loading..." : "Load More")}
		</button>
	`[0] as HTMLButtonElement
	loadBottomButtonObserve.observe(loadBottomButton)

	dom.append(
		fragment(html`
			${() => (!loading.ref && timeline.ref.posts.ref.length === 0 ? html`<div class="no-posts">No Posts</div>` : null)}
			<div class="posts">
				${derive(() => {
					const posts = timeline.ref.posts

					return awaited(
						timeline.ref.loadBottom().then(
							() => html`
								${each(posts)
									.key((post) => post.id)
									.as((post) => PostUI(post, null))}
							`
						)
					)
				}, [timeline])}
			</div>
		`)
	)

	return root
}
const style = css`
	:host {
		display: grid;
		gap: calc(var(--span) * 2.2);
	}

	button.load-more {
		justify-self: center;
		color: hsl(var(--base-text--hsl));
		background: hsl(var(--base--hsl));

		&:not(:disabled) {
			display: none;
		}
	}

	.posts {
		display: grid;
		gap: calc(var(--span) * 0.25);
	}

	.no-posts {
		display: grid;
		place-items: center;
		font-style: italic;
		padding: var(--span);
		opacity: 0.75;
	}
`
