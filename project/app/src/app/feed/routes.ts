import { string, tuple, union } from "zod";
import { FeedPage } from "~/app/feed/FeedPage";
import { Feed } from "~/features/post/lib/Feed";
import { Router } from "~/lib/router/mod";
import { Address } from "~/lib/solidity/primatives";

export const feedRoutes = {
	feed: new Router.Route({
		fromPathname(pathname) {
			return union([
				tuple([string()]),
				tuple([string(), Feed.Id()]),
				tuple([
					string(),
					Feed.Id(),
					string()
						.regex(/[0-9]+/)
						.transform(BigInt),
				]),
				tuple([
					string(),
					Feed.Id(),
					string()
						.regex(/[0-9]+/)
						.transform(BigInt),
					Address(),
				]),
			])
				.transform(([groupId, feedId, chainId, indexerAddress]) => {
					groupId ||= "~";
					return (
						feedId ?
							chainId ?
								indexerAddress ? { groupId, feedId, chainId, indexerAddress }
								:	{ groupId, feedId, chainId }
							:	{ groupId, feedId }
						:	{ groupId }
					);
				})
				.parse(pathname.split("/"));
		},
		toPathname(data) {
			return [data.groupId, data.feedId, data.chainId, data.indexerAddress]
				.filter(Boolean)
				.join("/");
		},
		render(data) {
			return data.feedId ? FeedPage(data) : null;
		},
	}),
};
