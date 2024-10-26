import { tags } from "@purifyjs/core";
import { feedRoutes } from "~/app/feed/routes";
import { FeedGroupAddFormPopoverButton } from "~/features/post/components/FeedGroupAddFormPopoverButton";
import { FeedScroller } from "~/features/post/components/FeedScroller";
import { PostForm } from "~/features/post/components/PostForm";
import { Feed } from "~/features/post/lib/Feed";
import { config } from "~/lib/config";
import { Address } from "~/lib/solidity/primatives";

const { div, a } = tags;

export function Profile(address: Address) {
	const profileFeedId = Feed.Id.fromAddress(address);

	return div().children(
		a()
			.href(feedRoutes.feed.toHref({ groupId: "~", feedId: profileFeedId }))
			.textContent("My Feed"),
		PostForm(),
		FeedGroupAddFormPopoverButton({
			values: {
				feedId: profileFeedId,
				label: `post ${address}`,
				address,
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
