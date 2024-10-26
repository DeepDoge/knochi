import { tags } from "@purifyjs/core";
import { FeedScroller } from "~/features/post/components/FeedScroller";
import { PostForm } from "~/features/post/components/PostForm";
import { Feed } from "~/features/post/lib/Feed";
import { config } from "~/lib/config";
import { Address } from "~/lib/solidity/primatives";

const { div } = tags;

export function Profile(address: Address) {
	return div().children(
		PostForm(),
		FeedScroller(
			new Feed({
				id: Feed.Id.fromAddress(address),
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
