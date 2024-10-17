import { tags } from "@purifyjs/core";
import { scope } from "~/utils/style";
import { PostViewer } from "./PostViewer";
import { Feed } from "./utils/Feed";

const { div, ul, li, button } = tags;

export function FeedViewer(feed: Feed) {
	const host = div().use(scope(""));

	const posts = ul();

	const next = feed.nextGenerator();
	const previous = feed.previousGenerator();

	let busy = false;
	loadMore();
	async function loadMore() {
		if (busy) return;
		busy = true;
		try {
			const result = await next.next();
			console.log(result);
			posts.element.append(...(result.value?.map((post) => li().children(PostViewer(post)).element) ?? []));
		} finally {
			busy = false;
		}
	}
	async function loadNewer() {
		if (busy) return;
		busy = true;
		try {
			/* const result = await previous.next();
			posts.element.append(...result.value.map((post) => li().children(PostViewer(post)).element)); */
		} finally {
			busy = false;
		}
	}

	return host.children(posts, button().onclick(loadMore).textContent("Load"));
}
