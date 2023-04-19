import type { Timeline } from "@/api/graph"
import { Post } from "@/libs/post"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal/readable"
import { css, html } from "master-ts/library/template"

const TimelineComponent = defineComponent("x-timeline")
export function Timeline(timeline: SignalReadable<Timeline>) {
	const component = new TimelineComponent()

	const firstload = $.derive(() => timeline.ref.loadBottom())

	const loadBottomButton = $.writable<HTMLButtonElement | null>(null)
	component.$subscribe(loadBottomButton, (button) => (loadBottomButtonObserve.disconnect(), button && loadBottomButtonObserve.observe(button)))
	const loadBottomButtonObserve = new IntersectionObserver((entries) => {
		if (!entries[0] || entries[0].intersectionRatio <= 0) return
		timeline.ref.loadBottom()
	})

	component.$html = html`
		<div class="posts">
			${$.await(firstload)
				.placeholder(() => "Loading...")
				.then(() =>
					$.each($.derive(() => timeline.ref.posts.ref))
						.key((post) => `${post.networkId}-${post.id}`)
						.as((post) => Post(post))
				)}
		</div>
		<button
            class="btn load-more"
			ref:=${loadBottomButton} 
			disabled=${() => (timeline.ref.loading.ref ? true : null)} 
			on:click=${() => timeline.ref.loadBottom()}
		>
			Load more
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
	}

	.posts {
		display: grid;
		gap: calc(var(--span) * 2.2);
	}
`
