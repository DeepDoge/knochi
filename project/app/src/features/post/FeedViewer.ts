import { tags } from "@purifyjs/core";
import { Bytes32Hex } from "~/utils/hex";
import { scope } from "~/utils/style";
import { PostViewer } from "./PostViewer";
import { FeedPost, getFeed } from "./utils/Feed";

const { div, ul, li } = tags;

export function FeedViewer(feedId: Bytes32Hex, startIndexInclusive: bigint = 0n) {
	const host = div().use(scope(""));

	const posts = ul();

	let oldestPost: FeedPost | null | undefined;
	let newestPost: FeedPost | undefined;
	let busy = false;
	loadMore();
	async function loadMore() {
		if (busy) return;
		busy = true;
		try {
			if (oldestPost === null) return;
			const response = await getFeed({
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
			const response = await getFeed({
				feedId,
				cursor: newestPost ? newestPost.index + 1n : 0n,
				direction: 1n,
				limit: 256n,
			});
			response.sort((a, b) => Number(b.time - a.time));
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

	return host.children(posts);
}
