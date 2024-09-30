import { tags } from "purify-js";
import { html } from "~/utils/html";
import { instancesOf } from "~/utils/instanceOf";
import { FeedPost } from "./feed";
import { PostContent } from "./utils";

const { article, header, address, time, div, a, template } = tags;

export function PostViewer(post: FeedPost) {
	const date = new Date(post.time);
	const content = PostContent.fromBytes(post.contentBytesHex);

	return article().children(
		header().children(
			[address().children("By ", a().rel("author").children(post.origin))],
			["on ", time({ pubdate: "pubdate" }).dateTime(date.toString()).children(date.toLocaleString())],
		),
		div().children(
			instancesOf(content, Error) ?
				html` <div>Test</div> `
			:	content.map((part) => {
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
