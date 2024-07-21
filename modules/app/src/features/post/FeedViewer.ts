import { globalSheet } from "@/styles";
import { sw } from "@/sw";
import { style } from "@/utils/style";
import { FeedPost } from "@modules/service/features/feed/calls";
import { Bytes32Hex } from "@modules/service/types";
import { fragment, tags } from "purify-js";
import { PostViewer } from "./PostViewer";

const { div, ul, li, address, time, a, header, article } = tags;

export function FeedViewer(feedId: Bytes32Hex, startIndexInclusive: bigint = 0n) {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, FeedViewerStyle.sheet);

	const posts = ul();

	let lastPost: FeedPost | null = null;
	let loadingMore = false;
	loadMore();
	async function loadMore() {
		if (loadingMore) return;
		loadingMore = true;
		try {
			const response = await sw.calls.getFeed(feedId, lastPost ? lastPost.index + 1n : 0n);
			posts.children(response.map((post) => li().children(PostViewer(post))));

			lastPost = response.at(-1) ?? null;
		} finally {
			loadingMore = false;
		}
	}

	shadow.append(fragment(posts));

	return host;
}

const FeedViewerStyle = style`
	${".hello"} {
		color: var(--primary);
		font-weight: bold;
		text-align: center;
		margin-bottom: 1em;
	}
`;
