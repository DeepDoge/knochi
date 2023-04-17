import type { PostData } from "@/api/graph"
import { secondTick } from "@/utils/ticks"
import { relativeTime } from "@/utils/time"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal/readable"
import { css, html } from "master-ts/library/template"

const PostComponent = defineComponent()
export function Post(post: SignalReadable<PostData>) {
	const component = new PostComponent()

	const textContents = $.derive(() =>
		post.ref.contents.filter((content) => content.type === "text").map((content) => ethers.utils.toUtf8String(content.value))
	)

	component.$html = html`
		<div class="author">
			${post.ref.author}
		</div>
		<div class="master">
			<div class="content">
				${() =>
					textContents.ref.map(
						(textContent) => html`
							<div>${textContent}</div>
						`
					)}
			</div>
		</div>
		<div class="other">
            <div class="created-at">
                ${$.derive(() => relativeTime(post.ref.createdAt), [secondTick, post])}
            </div>
		</div>
	`

	return component
}

PostComponent.$css = css`
	:host {
		display: grid;
		gap: 0.5em;
	}

	.master {
		display: grid;
		background-color: #202124;
		padding: 0.5em;
		border-radius: 0.75em;
	}

    .created-at {
        font-size: .75em
    }
`
