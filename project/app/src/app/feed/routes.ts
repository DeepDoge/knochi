import { tags } from "@purifyjs/core";
import { string, tuple, union } from "zod";
import { FeedGroupAddFormPopoverButton } from "~/features/post/components/FeedGroupAddFormPopoverButton";
import { FeedScroller } from "~/features/post/components/FeedScroller";
import { Feed } from "~/features/post/lib/Feed";
import { config } from "~/lib/config";
import { Router } from "~/lib/router/mod";
import { Address } from "~/lib/solidity/primatives";

const { div } = tags;

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
			if (!data.feedId) return null;

			const indexers: { chainId: bigint; address: Address }[] =
				data.chainId ?
					data.indexerAddress ?
						[{ chainId: data.chainId, address: data.indexerAddress }]
					:	(() => {
							const network = config.val.networks[`${data.chainId}`];
							if (!network) return [];
							return [
								{
									chainId: network.chainId,
									address: network.contracts.PostIndexer,
								},
							];
						})()
				:	Object.values(config.val.networks).map((network) => ({
						chainId: network.chainId,
						address: network.contracts.PostIndexer,
					}));

			return div().children(
				FeedGroupAddFormPopoverButton({
					values: {
						type: "feed",
						feedId: data.feedId,
						label: "",
					},
				})
					.attributes({ class: "button" })
					.textContent("add to group"),
				FeedScroller(
					new Feed({
						id: data.feedId,
						direction: -1n,
						limit: 2,
						indexers,
					}),
				),
			);
		},
	}),
};
