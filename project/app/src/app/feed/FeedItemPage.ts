import { awaited, tags } from "@purifyjs/core";
import { FeedItem } from "~/app/feed/FeedItem";
import { FeedScroller } from "~/app/feed/FeedScroller";
import { FeedForm } from "~/features/feed/components/FeedForm";
import { Feed } from "~/features/feed/lib/Feed";
import { Post, PostLoadParams } from "~/features/feed/lib/Post";
import { config } from "~/shared/config";

const { div, strong } = tags;

export function FeedItemPage(params: PostLoadParams) {
	const postPromise = Post.load(params);
	const repliesFeedId = Feed.Id.ofPostReplies(params);
	const repliesFeed = new Feed({
		id: repliesFeedId,
		direction: -1n,
		indexers: Object.values(config.val.networks).map((network) => ({
			chainId: network.chainId,
			address: network.contracts.PostIndexer,
		})),
		limit: 64,
	});

	return div().children(
		// We wait for post for everything because we dont want layout shift
		awaited(
			postPromise.then((post) => [
				FeedItem(post),
				strong().textContent("Replies"),
				FeedForm([repliesFeed.id]),
				FeedScroller(repliesFeed),
			]),
		),
	);
}
