import { tags } from "@purifyjs/core";
import { Post } from "~/app/feed/lib/Post.ts";
import { PostContent } from "~/app/feed/lib/PostContent.ts";
import { postSearchParam } from "~/app/feed/routes.ts";
import { WalletAddress, WalletAvatarSvg } from "~/domains/wallet/mod.ts";
import { css, useScope } from "~/shared/css.ts";
import { getRelativeTimeSignal } from "~/shared/time.ts";

const { article, footer, address, time, div, a } = tags;

export function PostView(post: Post) {
	const date = new Date(Number(post.createdAt) * 1000);

	return article()
		.effect(useScope(FeedItemCss))
		.children(
			div({ class: "avatar" }).ariaHidden("true").children(WalletAvatarSvg(post.author)),
			div({ class: "content" }).children(
				post.content.map((part) => {
					switch (part.type) {
						case PostContent.Part.TypeMap.Text:
							return part.value;
						default:
							return part.value;
					}
				}),
			),
			footer().children(
				a()
					.rel("author")
					.children(address().children(WalletAddress(post.author))),
				time({ pubdate: "pubdate" })
					.dateTime(date.toISOString())
					.children(
						a()
							.href(postSearchParam.toHref(post.toSearchParam()))
							.children(getRelativeTimeSignal(date)),
					),
			),
		);
}

const FeedItemCss = css`
	:scope {
		display: block grid;
		grid-template-areas:
			"avatar . content"
			"avatar . ."
			"avatar . footer";
		grid-template-columns: 1.1em 0.25em 1fr;
		grid-template-rows: auto 0.5em auto;
	}

	.avatar {
		grid-area: avatar;
		align-self: end;
	}

	.content {
		grid-area: content;
		color: color-mix(in srgb, transparent, currentColor 95%);
	}

	footer {
		grid-area: footer;
		display: block grid;
		gap: 0.5em;
		grid-template-columns: minmax(0, 16ch) auto;
		align-items: center;
	}

	a[rel="author"] {
		font-weight: bold;
		font-size: 0.9em;
		color: color-mix(in srgb, transparent, currentColor 85%);
	}

	time {
		font-size: 0.6em;
		color: color-mix(in srgb, transparent, currentColor 70%);
	}
`;
