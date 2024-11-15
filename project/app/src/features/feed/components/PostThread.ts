import { tags } from "@purifyjs/core";
import { FeedForm } from "~/features/feed/components/FeedForm";
import { FeedScroller } from "~/features/feed/components/FeedScroller";
import { Feed } from "~/features/feed/Feed";
import { Post } from "~/features/post/Post";
import { PostView } from "~/features/post/PostView";
import { config } from "~/shared/config";

const { div, strong } = tags;

export function PostThread(post: Post) {
	const repliesFeed = config.derive((config) => Feed.PostReplies({ post, config }));
	return div().children(
		PostView(post),
		strong().textContent("Replies"),
		repliesFeed.derive((repliesFeed) => [
			FeedForm([repliesFeed.id]),
			FeedScroller(repliesFeed),
		]),
	);
}
