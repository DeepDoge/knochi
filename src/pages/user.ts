import { getPosts } from "@/api/graph"
import { Post } from "@/libs/post"
import type { Address } from "@/utils/address"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal/readable"
import { css, html } from "master-ts/library/template"

const UserPageComponent = defineComponent("x-user-page")
export function UserPage(userAddress: SignalReadable<Address>) {
	const component = new UserPageComponent()

	const posts = $.derive(() => getPosts(userAddress.ref))

	component.$html = html`
		<h1>User Page</h1>

		<div class="posts">
			${$.await(posts)
				.placeholder(() => "Loading...")
				.then((posts) =>
					$.each(posts)
						.key((post) => post.id)
						.as((post) => Post(post))
				)}
		</div>
	`

	return component
}
UserPageComponent.$css = css`
	.posts {
		display: grid;
		grid-template-columns: minmax(0, 35em);
		gap: calc(var(--span) * 2.2);
		justify-content: center;
	}
`
