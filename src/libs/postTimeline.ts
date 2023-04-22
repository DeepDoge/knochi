import { getPost, getTimeline, PostId } from "@/api/graph"
import { Post } from "@/libs/post"
import { Timeline } from "@/libs/timeline"
import { routeHref } from "@/route"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

const PostPageComponent = defineComponent("x-post-page")
export function PostPage(postId: PostId) {
	const component = new PostPageComponent()

	const post = $.await($.derive(() => getPost(postId))).then()
	const repliesTimeline = $.derive(() => getTimeline({ parentId: postId }))

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
				${() => Timeline(repliesTimeline.ref)}
			</div>
		</div>
	`

	return component
}

PostPageComponent.$css = css`
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
