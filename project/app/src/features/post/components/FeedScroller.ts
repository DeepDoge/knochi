import { tags } from "@purifyjs/core";
import { scope } from "~/lib/css";
import { Feed } from "../lib/Feed";
import { PostArticle } from "./PostArticle";

const { div, ul, li, button } = tags;

export function FeedScroller(feed: Feed) {
	const host = div().use(scope(""));

	const posts = ul();

	const next = feed.nextGenerator();

	let busy = false;
	loadMore();
	async function loadMore() {
		if (busy) return;
		busy = true;
		try {
			const result = await next.next();

			posts.element.append(
				...(result.value?.map((post) => li().children(PostArticle(post)).element) ?? []),
			);
		} finally {
			busy = false;
		}
	}

	return host.children(posts, button().onclick(loadMore).textContent("Load"));
}
