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
    <slot></slot>
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
        position: relative;
		display: grid;
		gap: 0.5em;
        background-color: hsl(var(--base-hsl), 50%);
        color: hsl(var(--base-text-hsl));
        padding: calc(var(--span) * .5);
        border-radius: var(--radius);
        border: 1px solid hsl(var(--base-hsl))
	}

    :host::before {
        content: "";
        position: absolute;
        inset: 0;
        background-color: hsl(var(--master-hsl), 20%);
        z-index: -1;
        border-radius: inherit;
        filter: blur(1rem);
    }

	.master {
		display: grid;
		background-color: hsl(var(--base-hsl));
		padding: calc(var(--span) * .5);
		border-radius: var(--radius);
	}

    .created-at {
        font-size: .75em
    }
`
