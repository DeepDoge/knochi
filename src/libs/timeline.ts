import type { Timeline } from "@/api/graph"
import { Post } from "@/libs/post"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal/readable"
import { css, html } from "master-ts/library/template"

const TimelineComponent = defineComponent("x-timeline")
export function Timeline(timeline: SignalReadable<Timeline>) {
	const component = new TimelineComponent()

	const firstload = $.derive(() => timeline.ref.loadBottom(), [timeline])

	const loadBottomButton = $.writable<HTMLButtonElement | null>(null)
	component.$subscribe(loadBottomButton, (button) => (loadBottomButtonObserve.disconnect(), button && loadBottomButtonObserve.observe(button)))
	const loadBottomButtonObserve = new IntersectionObserver((entries) => {
		if (!entries[0] || entries[0].intersectionRatio <= 0) return
		timeline.ref.loadBottom()
	})

	const loading = $.derive(() => timeline.ref.loading.ref)

	component.$html = html`
		${() => (!loading.ref && timeline.ref.posts.ref.length === 0 ? html`<div class="no-posts">No Posts</div>` : null)}
		<div class="posts">
			${$.await(firstload).then(() =>
				$.each($.derive(() => timeline.ref.posts.ref))
					.key((post) => `${post.chainKey}-${post.id}`)
					.as((post) => Post(post))
			)}
		</div>
		<button
            class="btn load-more"
			ref:=${loadBottomButton} 
			disabled=${() => (loading.ref ? "" : null)}
			on:click=${() => timeline.ref.loadBottom()}
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
