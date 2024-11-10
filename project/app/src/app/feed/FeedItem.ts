import { tags } from "@purifyjs/core";
import { Post } from "~/features/feed/lib/Post";
import { PostContent } from "~/features/feed/lib/PostContent";
import { css, useScope } from "~/lib/css";
import { getRelativeTimeSignal } from "~/lib/time";
import { WalletAddress } from "~/lib/wallet/components/WalletAddress";
import { WalletAvatarSvg } from "~/lib/wallet/components/WalletAvatarSvg";

const { article, footer, address, time, div, a } = tags;

export function FeedItem(post: Post) {
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
					.children(getRelativeTimeSignal(date)),
			),
		);
}

const FeedItemCss = css`
	:scope {
		display: grid;
		grid-template-areas:
			"avatar . content"
			"avatar . ."
			"avatar . footer";
		grid-template-columns: 1.25em 0.25em 1fr;
		grid-template-rows: auto 0.5em auto;

		padding: 0.5em;
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
		display: grid;
		gap: 0.5em;
		grid-template-columns: minmax(0, 16ch) auto;
		align-items: center;
	}

	a[rel="author"] {
		font-weight: bold;
	}

	time {
		font-size: 0.6em;
		color: color-mix(in srgb, transparent, currentColor 75%);
	}
`;
