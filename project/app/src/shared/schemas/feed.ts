import { Hex } from "~/shared/schemas/primatives";

declare const FEED_ID: unique symbol;
export type FeedId = Hex<"32"> & { [FEED_ID]?: true };
export function FeedId() {
	return Hex("32").transform((value) => value as FeedId);
}
