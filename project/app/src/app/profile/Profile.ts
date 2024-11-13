import { tags } from "@purifyjs/core";
import { FeedScroller } from "~/app/feed/FeedScroller";
import { FeedForm } from "~/features/feed/components/FeedForm";
import { FeedGroupAddFormPopoverButton } from "~/features/feed/components/FeedGroupAddFormPopoverButton";
import { Feed } from "~/features/feed/lib/Feed";
import { config } from "~/shared/config";
import { Address } from "~/shared/solidity/primatives";

const { div } = tags;

export function Profile(address: Address) {
	const profileFeedId = Feed.Id.ofProfile(address);

	return div().children(
		FeedForm([profileFeedId]),
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
		FeedScroller(
			new Feed({
				id: profileFeedId,
				direction: -1n,
				limit: 64,
				indexers: Object.values(config.val.networks).map((network) => ({
					chainId: network.chainId,
					address: network.contracts.PostIndexer,
				})),
			}),
		),
	);
}
