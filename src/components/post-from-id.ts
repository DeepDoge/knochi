import { commonStyle } from "@/import-styles"
import { Post } from "@/utils/post"
import type { PostId } from "@/utils/post-id"
import type { Call, Tuples } from "hotscript"
import { derive, fragment, type Signal } from "master-ts/core"
import { awaited } from "master-ts/extra/awaited"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"
import { match } from "master-ts/extra/match"
import { PostUI } from "./post"

const postFromIdTag = defineCustomTag("x-post-from-id")
export function PostFromIdUI(postId: Signal<PostId>, ...args: Call<Tuples.Drop<1>, Parameters<typeof PostUI>>) {
	const root = postFromIdTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const post = derive(() => awaited(Post.getPosts([postId.ref]).then((posts) => posts[0] ?? null)).ref, [postId])

	dom.append(
		fragment(html`
			${match(post)
				.case(null, () => null)
				.default((post) => PostUI(post, ...args))}
		`)
	)

	return root
}

const style = css`
	:host {
		display: contents;
	}
`
