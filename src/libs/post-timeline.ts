import { getPosts, getTimeline } from "@/api/graph"
import { Post } from "@/libs/post"
import { Timeline } from "@/libs/timeline"
import { routeHref } from "@/router"
import type { PostId } from "@/utils/post-id"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { PostForm } from "./post-form"

const PostTimelineComponent = defineComponent("x-post-timeline")
export function PostTimeline(postId: SignalReadable<PostId>) {
	const component = new PostTimelineComponent()

	const post = $.await($.derive(() => getPosts([postId.ref]).then((posts) => posts[0] ?? null), [postId])).then()
	const repliesTimeline = $.derive(() => getTimeline({ parentId: postId.ref }))

	component.$html = html`
		<div class="top">
			<a class="btn" href=${routeHref({ postId: null })}>← Close</a>
			<span class="title">Post</span>
		</div>
		<div class="content">
			<div class="family">
				${$.match(post)
					.case(null, () => null)
					.default((post) => Post(post))}
			</div>
			<div class="replies">
				<h3>Replies</h3>
				${PostForm(postId)} ${Timeline(repliesTimeline)}
			</div>
		</div>
	`

	return component
}

PostTimelineComponent.$css = css`
	:host {
		display: grid;
		gap: calc(var(--span) * 1);
	}

	.top {
		display: grid;
		grid-auto-flow: column;
		justify-content: start;
		align-items: center;
		gap: calc(var(--span) * 0.5);

		& .title {
			font-weight: bold;
			font-size: 1.5em;
		}
	}

	.content {
		display: grid;
		gap: var(--span);
	}
`
