import { tags } from "purify-js";
import { WalletAddress } from "~/features/wallet/WalletAddress";
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
			["By ", address().children(a().rel("author").children(WalletAddress(post.origin)))],
			["on ", time({ pubdate: "pubdate" }).dateTime(date.toISOString()).children(date.toLocaleString())],
		),
		div().children(
			instancesOf(content, Error) ?
				html` <div>Test</div> `
			:	content.map((part) => {
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
