import { tags } from "@purifyjs/core";
import { FeedForm } from "~/app/feed/components/FeedForm.ts";
import { FeedScroller } from "~/app/feed/FeedScroller.ts";
import { Post } from "~/app/feed/lib/Post.ts";
import { PostView } from "~/app/feed/PostView.ts";
import { config } from "~/shared/config.ts";

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
