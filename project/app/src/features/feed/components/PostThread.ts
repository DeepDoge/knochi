import { tags } from "@purifyjs/core";
import { FeedForm } from "~/features/feed/components/FeedForm";
import { FeedScroller } from "~/features/feed/components/FeedScroller";
import { Feed } from "~/features/feed/Feed";
import { Post } from "~/features/post/Post";
import { PostView } from "~/features/post/PostView";
import { config } from "~/shared/config";
import { css, useScope } from "~/shared/utils/css";
import { usePart } from "~/shared/utils/effects/usePart";

const { div, section, strong } = tags;

export function PostThread(post: Post) {
	const repliesFeed = config.derive((config) => Feed.PostReplies({ post, config }));
	return div()
		.effect(useScope(PostThreadCss))
		.children(
			PostView(post).effect(usePart("post")),
			section({ class: "replies" })
				.ariaLabel("replies")
				.children(
					strong().textContent("Replies"),
					repliesFeed.derive((repliesFeed) =>
						FeedScroller(repliesFeed).effect(usePart("scroller")),
					),
				),
			repliesFeed.derive((repliesFeed) => FeedForm([repliesFeed.id]).effect(usePart("form"))),
		);
}

const PostThreadCss = css`
	.replies {
		padding: 0.75em;
		font-size: 0.85em;
	}

	[data-part="post"] {
		padding: 1.5em;
		font-size: 0.9em;
	}

	[data-part="scroller"] {
		min-block-size: 100dvb;
	}

	[data-part="form"] {
		position: sticky;
		inset-block-end: 0;
	}
`;
