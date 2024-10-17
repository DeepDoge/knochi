import { PostContent } from "~/features/post/utils/PostContent";
import { Address, BytesHex } from "~/utils/solidity/primatives";

export class Post {
	content: PostContent;

	constructor(
		public readonly postId: BytesHex<12>,
		public readonly storeAddress: Address,
		content: BytesHex,
	) {
		this.content = PostContent.fromBytes(content);
	}
}
