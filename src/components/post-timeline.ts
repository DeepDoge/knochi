import { PostFormUI } from "@/components/post-form"
import { TimelineUI } from "@/components/timeline"
import { commonStyle } from "@/import-styles"
import { route, routeHash } from "@/router"
import { Post } from "@/utils/post"
import type { PostId } from "@/utils/post-id"
import { Timeline } from "@/utils/timeline"
import { derive, fragment, type Signal } from "master-ts/core"
import { awaited } from "master-ts/extra/awaited"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"
import { INSTANCEOF, match } from "master-ts/extra/match"
import { PostUI } from "./post"

const postTimelineTag = defineCustomTag("x-post-timeline")
export function PostTimelineUI(postId: Readonly<Signal<PostId>>) {
	const root = postTimelineTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const post = awaited(
		Post.getPosts([postId.ref])
			.then((posts) => posts[0] ?? null)
			.catch((error) => (error instanceof Error ? error : new Error(`${error}`)))
	)
	const repliesTimeline = derive(() => Timeline.create({ parentId: postId.ref }))

	dom.append(
		fragment(html`
			<div class="top">
				<a class="btn" href=${derive(() => routeHash({ postId: null }), [route.path])}>← Close</a>
				<h2 class="title">Post</h2>
			</div>
			<div class="content">
				<div class="family">
					${match(post)
						.case(null, () => null)
						.case(
							{ [INSTANCEOF]: Error },
							(error) => html`
								<div class="error">
									Can't load post ${postId}
									<code><pre>${error.ref.message}</pre></code>
								</div>
							`
						)
						.default((post) => PostUI(post, null))}
				</div>
				<div class="replies">
					<h3 class="title">Replies</h3>
					<x ${PostFormUI(postId)} class="form"></x>
					<x ${TimelineUI(repliesTimeline)} class="timeline"></x>
				</div>
			</div>
		`)
	)

	return root
}

const style = css`
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

		& > .title {
			font-weight: bold;
			font-size: 1.5em;
		}
	}

	.content {
		display: grid;
		gap: calc(var(--span) * 1);
	}

	.replies {
		display: grid;

		grid-template-areas:
			"title"
			"."
			"form"
			"."
			"timeline";
		grid-template-rows: auto calc(var(--span) * 0.5) auto calc(var(--span) * 2) auto;

		& > .title {
			grid-area: title;
		}
		& > .form {
			grid-area: form;
		}
		& > .timeline {
			grid-area: timeline;
		}
	}
`
