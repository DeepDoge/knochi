import { ProfileNameUI } from "@/components/profile-name"
import { commonStyle } from "@/import-styles"
import { Address } from "@/utils/address"
import type { Post } from "@/utils/post"
import { PostId } from "@/utils/post-id"
import { ethers } from "ethers"
import { derive, fragment, type Signal } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { each } from "master-ts/extra/each"
import { html } from "master-ts/extra/html"
import { match } from "master-ts/extra/match"
import { PostFromIdUI } from "./post-from-id"

const postContentTag = defineCustomTag("x-post-content")
export function PostContentUI(post: Readonly<Signal<Post>>) {
	const root = postContentTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const postContents = derive(() => post.ref.contents)

	dom.append(
		fragment(html`
			${each(postContents)
				.key((item) => item)
				.as((content) =>
					match(content)
						// TODO: This doesn't handle errors
						.case({ type: "text" }, (content) => html`<span>${derive(() => ethers.toUtf8String(content.ref.value))}</span>`)
						.case({ type: "@" }, (content) => ProfileNameUI(derive(() => Address.from(ethers.toUtf8String(content.ref.value)))))
						.case({ type: "echo" }, (content) =>
							match(derive(() => PostId.fromUint8Array(content.ref.value)))
								.case(post.ref.id, () => null)
								.default((postId) => PostFromIdUI(postId, null))
						)
						.default(() => null)
				)}
		`)
	)

	return root
}

const style = css`
	:host {
		font-size: 1.1em;

		display: flex;
		gap: 0.5ch;
		flex-wrap: wrap;
		align-items: center;
		justify-content: start;
	}
`
