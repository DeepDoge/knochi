export type FeedPost = {
	origin: `0x${string}`;
	sender: `0x${string}`;
	id: string;
	index: bigint;
	time: number;
	contentBytesHex: string;
};
