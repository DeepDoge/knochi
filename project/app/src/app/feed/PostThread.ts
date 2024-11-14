import { tags } from "@purifyjs/core";
import { FeedScroller } from "~/app/feed/FeedScroller";
import { PostView } from "~/app/feed/PostView";
import { FeedForm } from "~/features/feed/components/FeedForm";
import { Post } from "~/features/feed/lib/Post";
import { config } from "~/shared/config";

const { div, strong } = tags;

export function PostThread(post: Post) {
	const repliesFeed = config.derive((config) => post.replies(config));
	return div().children(
		PostView(post),
		strong().textContent("Replies"),
		repliesFeed.derive((repliesFeed) => [
			FeedForm([repliesFeed.id]),
			FeedScroller(repliesFeed),
		]),
	);
}
