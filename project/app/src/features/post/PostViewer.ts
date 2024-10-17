import { tags } from "@purifyjs/core";
import { WalletAddress } from "~/features/wallet/WalletAddress";
import { PostContent } from "./utils";
import { FeedPost } from "./utils/Feed";

const { article, header, address, time, div, a, template } = tags;

export function PostViewer(post: FeedPost) {
	const date = new Date(Number(post.time) * 1000);

	return article().children(
		header().children(
			["By ", address().children(a().rel("author").children(WalletAddress(post.author)))],
			["on ", time({ pubdate: "pubdate" }).dateTime(date.toISOString()).children(date.toLocaleString())],
		),
		div().children(
			post.content.map((part) => {
				switch (part.type) {
					case PostContent.Part.TypeMap.Text:
						return part.value;
					default:
						return part.value;
				}
			}),
		),
	);
}
