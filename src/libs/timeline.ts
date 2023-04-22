import type { Timeline } from "@/api/graph"
import { Post } from "@/libs/post"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

const TimelineComponent = defineComponent("x-timeline")
export function Timeline(timeline: Timeline) {
	const component = new TimelineComponent()

	const firstload = timeline.loadBottom()

	const loadBottomButton = $.writable<HTMLButtonElement | null>(null)
	component.$subscribe(loadBottomButton, (button) => (loadBottomButtonObserve.disconnect(), button && loadBottomButtonObserve.observe(button)))
	const loadBottomButtonObserve = new IntersectionObserver((entries) => {
		if (!entries[0] || entries[0].intersectionRatio <= 0) return
		timeline.loadBottom()
	})

	const loading = $.derive(() => timeline.loading.ref)

	component.$html = html`
		${() => (!loading.ref && timeline.posts.ref.length === 0 ? html`<div class="no-posts">No Posts</div>` : null)}
		<div class="posts">
			${$.await(firstload).then(() =>
				$.each(timeline.posts) /* this needs a fix, we are not suppose to do that */
					.key((post) => `${post.chainKey}-${post.id}`)
					.as((post) => Post(post))
			)}
		</div>
		<button
            class="btn load-more"
			ref:=${loadBottomButton} 
			disabled=${() => (loading.ref ? "" : null)}
			on:click=${() => timeline.loadBottom()}
		>
			${() => (loading.ref ? "Loading..." : "Load More")}
		</button>
	`
	loadBottomButtonObserve.observe(loadBottomButton.ref!)

	return component
}
TimelineComponent.$css = css`
	:host {
		display: grid;
		gap: calc(var(--span) * 2.2);
	}

	button.load-more {
		justify-self: center;

		&:not(:disabled) {
			display: none;
		}
	}

	.posts {
		display: grid;
		gap: calc(var(--span) * 2.2);
	}

	.no-posts {
		display: grid;
		place-items: center;
		font-style: italic;
		padding: var(--span);
		opacity: 0.75;
	}
`
