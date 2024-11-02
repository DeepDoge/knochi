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
			div().children(
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
				time({ pubdate: "pubdate" })
					.dateTime(date.toISOString())
					.children(getRelativeTimeSignal(date)),
				a()
					.rel("author")
					.children(
						WalletAvatarSvg(post.author),
						address().children(WalletAddress(post.author)),
					),
			),
		);
}

const FeedItemCss = css`
	:scope {
		display: grid;
		gap: 0.5em;

		border-inline-start: solid;
		border-width: 0.15em;
		border-color: color-mix(in srgb, transparent, currentColor 85%);

		padding: 0.5em;
	}

	footer {
		display: grid;
		gap: 0.5em;

		color: color-mix(in srgb, transparent, currentColor 75%);
	}

	a[rel="author"] {
		display: grid;
		align-items: center;
		grid-template-columns: 1em minmax(0, 10em);
		gap: 0.5em;
		font-size: 0.8em;
	}

	time {
		font-size: 0.7em;
	}
`;
