import { tags } from "@purifyjs/core";
import { Post } from "~/features/post/lib/Post";
import { PostContent } from "~/features/post/lib/PostContent";
import { WalletAddress } from "~/lib/wallet/components/WalletAddress";

const { article, header, address, time, div, a } = tags;

export function PostViewer(post: Post) {
	const date = new Date(Number(post.createdAt) * 1000);

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
