import { posts_feed } from "@root/service";
import { fragment, tags } from "purify-js";
import { globalSheet } from "~/styles";
import { sw } from "~/sw";
import { Bytes32Hex } from "~/utils/hex";
import { style } from "~/utils/style";
import { PostViewer } from "./PostViewer";

const { div, ul, li } = tags;

export function FeedViewer(feedId: Bytes32Hex, startIndexInclusive: bigint = 0n) {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, FeedViewerStyle.sheet);

	const posts = ul();

	let oldestPost: posts_feed.FeedPost | null | undefined;
	let newestPost: posts_feed.FeedPost | undefined;
	let busy = false;
	loadMore();
	async function loadMore() {
		if (busy) return;
		busy = true;
		try {
			if (oldestPost === null) return;
			const response = await sw.use("/posts/feed").getFeed({
				feedId,
				cursor: oldestPost ? oldestPost.index - 1n : null,
				direction: -1n,
				limit: 256n,
			});
			posts.children(response.map((post) => li().children(PostViewer(post))));

			oldestPost = response.at(-1) ?? null;
			if (!newestPost) {
				const newest = response.at(0);
				if (newest) newestPost = newest;
			}
		} finally {
			busy = false;
		}
	}
	async function loadNewer() {
		if (busy) return;
		busy = true;
		try {
			const response = await sw.use("/posts/feed").getFeed({
				feedId,
				cursor: newestPost ? newestPost.index + 1n : 0n,
				direction: 1n,
				limit: 256n,
			});
			response.sort((a, b) => b.time - a.time);
			posts.element.prepend(...response.map((post) => li().children(PostViewer(post)).element));

			const newest = response.at(0);
			if (newest) {
				newestPost = newest;
			}
		} finally {
			busy = false;
		}
	}

	host.element.onConnect(() => {
		const interval = setInterval(() => {
			loadNewer();
		}, 10000);
		return () => clearInterval(interval);
	});

	shadow.append(fragment(posts));

	return host;
}

const FeedViewerStyle = style`

`;
