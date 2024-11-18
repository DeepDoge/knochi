import { awaited, Signal, tags } from "@purifyjs/core";
import { PostThread } from "~/features/feed/components/PostThread";
import { Post } from "~/features/post/Post";
import { postSearchParam } from "~/features/post/routes";
import { CloseSvg } from "~/shared/svgs/CloseSvg";
import { css, useScope } from "~/shared/utils/css";

const { section, div, header, a, strong } = tags;

export function PostThreadView(postPromise: Signal<Promise<Post | null>>) {
	return section({ class: "post" })
		.effect(useScope(PostThreadViewCss))
		.role("complementary")
		.ariaLabel("Post")
		.children(
			header().children(
				a({ class: "icon close" })
					.ariaHidden("true")
					.href(postSearchParam.toHref(null))
					.children(CloseSvg()),
				strong().textContent("Post"),
			),
			div({ class: "contents" }).children(
				postPromise.derive((postPromise) => {
					return awaited(
						postPromise.then((post) => {
							if (!post) return null; // not found
							return PostThread(post);
						}),
						null, // loading
					);
				}),
			),
		);
}

export const PostThreadViewCss = css`
	:scope {
		display: block grid;
		gap: 1em;
		align-content: start;
		isolation: isolate;
	}

	.contents {
		z-index: -1;
	}

	header {
		position: sticky;
		inset-block-start: 0;

		display: block flex;
		align-items: center;
		gap: 1em;

		background-color: color-mix(in srgb, var(--base), var(--pop) 2.5%);
		padding-inline: 1em;
		padding-block: 1.25em;

		.icon {
			inline-size: 1.5em;
			border-radius: 50%;
			aspect-ratio: 1;
			color: color-mix(in srgb, var(--base), var(--pop) 50%);
		}

		strong {
			font-size: 1.1em;
		}
	}
`;
