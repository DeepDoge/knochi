import { tags } from "@purifyjs/core";
import { FeedScroller } from "~/app/feed/FeedScroller";
import { FeedForm } from "~/features/feed/components/FeedForm";
import { FeedGroupAddFormPopoverButton } from "~/features/feed/components/FeedGroupAddFormPopoverButton";
import { Feed } from "~/features/feed/lib/Feed";
import { config } from "~/shared/config";
import { css, useScope } from "~/shared/css";
import { usePart } from "~/shared/effects/userPart";
import { Address } from "~/shared/solidity/primatives";

const { div } = tags;

export function ProfileView(address: Address) {
	const profileFeedId = Feed.Id.ofProfile(address);
	const profileFeed = new Feed({
		id: profileFeedId,
		direction: -1n,
		limit: 64,
		indexers: Object.values(config.val.networks).map((network) => ({
			chainId: network.chainId,
			address: network.contracts.PostIndexer,
		})),
	});

	return div()
		.effect(useScope(ProfileViewCss))
		.children(
			FeedGroupAddFormPopoverButton({
				values: {
					feedId: profileFeedId,
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
			FeedForm([profileFeedId]).effect(usePart("form")),
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
