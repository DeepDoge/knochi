import { tags } from "@purifyjs/core";
import { Post } from "~/features/post/Post";
import { PostContent } from "~/features/post/PostContent";
import { postSearchParam } from "~/features/post/routes";
import { getRelativeTimeSignal } from "~/shared/language/time";
import { css, useScope } from "~/shared/utils/css";
import { WalletAddress } from "~/shared/wallet/components/WalletAddress";
import { WalletAvatarSvg } from "~/shared/wallet/components/WalletAvatarSvg";

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
		grid-template-columns: 2em 0.5em 1fr;
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
