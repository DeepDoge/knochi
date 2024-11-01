import { tags } from "@purifyjs/core";
import { FeedScroller } from "~/app/feed/FeedScroller";
import { FeedGroupAddFormPopoverButton } from "~/features/post/components/FeedGroupAddFormPopoverButton";
import { PostForm } from "~/features/post/components/PostForm";
import { Feed } from "~/features/post/lib/Feed";
import { config } from "~/lib/config";
import { Address } from "~/lib/solidity/primatives";

const { div } = tags;

export function Profile(address: Address) {
	const profileFeedId = Feed.Id.fromAddress(address);

	return div().children(
		PostForm(),
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
				limit: 2,
				indexers: Object.values(config.val.networks).map((network) => ({
					chainId: network.chainId,
					address: network.contracts.PostIndexer,
				})),
			}),
		),
	);
}
