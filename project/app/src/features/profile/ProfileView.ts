import { tags } from "@purifyjs/core";
import { FeedForm } from "~/features/feed/components/FeedForm";
import { FeedScroller } from "~/features/feed/components/FeedScroller";
import { Feed } from "~/features/feed/Feed";
import { Address } from "~/shared/schemas/primatives";
import { css, useScope } from "~/shared/utils/css";
import { usePart } from "~/shared/utils/effects/usePart";

const { div } = tags;

export function ProfileView(params: { address: Address; postsFeed: Feed }) {
	const { postsFeed } = params;

	return div()
		.effect(useScope(ProfileViewCss))
		.children(
			div({ class: "content" }).children(FeedScroller(postsFeed)),
			FeedForm([postsFeed.id]).effect(usePart("form")),
		);
}

const ProfileViewCss = css`
	.content {
		min-block-size: 100dvb;
		padding-inline: 0.75em;

		display: block grid;
		grid-template-columns: minmax(0, 60em);
		justify-content: center;
	}

	[data-part="form"] {
		position: sticky;
		inset-block-end: 0;
	}
`;
