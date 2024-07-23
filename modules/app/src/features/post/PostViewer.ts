import { Feed } from "@root/service";
import { tags } from "purify-js";
import { PostContent } from "./utils";

const { article, header, address, time, div, a } = tags;

export function PostViewer(post: Feed.FeedPost) {
	const date = new Date(post.time);
	const content = PostContent.fromBytes(post.contentBytesHex);

	return article().children(
		header().children(
			[address().children("By ", a().rel("author").children(post.origin))],
			["on ", time({ pubdate: "pubdate" }).dateTime(date.toString()).children(date.toLocaleString())],
		),
		div().children(
			content.map((part) => {
				switch (part.type) {
					case PostContent.Part.TypeMap.Text:
						part.value;
					default:
						return part.value;
				}
			}),
		),
	);
}
