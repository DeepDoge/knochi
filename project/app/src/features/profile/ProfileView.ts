import { tags } from "@purifyjs/core";
import { FeedForm } from "~/features/feed/components/FeedForm";
import { FeedGroupAddFormPopoverButton } from "~/features/feed/components/FeedGroupAddFormPopoverButton";
import { FeedScroller } from "~/features/feed/components/FeedScroller";
import { Feed } from "~/features/feed/Feed";
import { Config } from "~/shared/config";
import { Address } from "~/shared/schemas/primatives";
import { css, useScope } from "~/shared/utils/css";
import { usePart } from "~/shared/utils/effects/usePart";

const { div } = tags;

export function ProfileView(params: { address: Address; config: Config }) {
	const { config, address } = params;

	const profileFeed = Feed.ProfilePosts({ address, config });

	return div()
		.effect(useScope(ProfileViewCss))
		.children(
			FeedGroupAddFormPopoverButton({
				values: {
					feedId: profileFeed.id,
					style: {
						type: "profile",
						address,
						label: "posts",
					},
				},
			})
				.attributes({ class: "button" })
				.textContent("add to group"),
			FeedScroller(profileFeed).effect(usePart("scroller")),
			FeedForm([profileFeed.id]).effect(usePart("form")),
		);
}

const ProfileViewCss = css`
	[data-part="scroller"] {
		min-block-size: 100dvb;
	}

	[data-part="form"] {
		position: sticky;
		inset-block-end: 0;
	}
`;
