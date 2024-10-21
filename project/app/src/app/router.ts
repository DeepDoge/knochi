import { fragment } from "@purifyjs/core";
import { FeedViewer } from "~/features/post/components/FeedViewer";
import { Feed } from "~/features/post/lib/Feed";
import { postRoutes } from "~/features/post/routes";
import { config } from "~/lib/config";
import { Router } from "~/lib/router/mod";
import { Address } from "~/lib/solidity/primatives";

export const router = new Router({
	profile: new Router.Route({
		fromPathname(pathname) {
			return Address()
				.transform((address) => ({ address }))
				.parse(pathname.slice(1));
		},
		toPathname(data) {
			return `/${data.address}`;
		},
		render(data) {
			return fragment(
				"Hello",
				FeedViewer(
					new Feed({
						id: Feed.Id.fromAddress(data.address),
						direction: -1n,
						limit: 1,
						chainIds: Object.values(config.val.networks).map((network) => network.chainId),
					}),
				),
			);
		},
	}),
	...postRoutes,
});
