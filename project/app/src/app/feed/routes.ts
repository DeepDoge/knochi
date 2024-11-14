import { FeedPage } from "~/app/feed/FeedPage.ts";
import { Feed } from "~/app/feed/lib/Feed.ts";
import { Router } from "~/domains/router/mod.ts";

export const feedRoutes = {
	feed: new Router.Route({
		fromPathname(pathname) {
			return Feed.Id()
				.transform((feedId) => ({ feedId }))
				.parse(pathname.split("/"));
		},
		toPathname(data) {
			return data.feedId;
		},
		render(data) {
			return data.feedId ? FeedPage(data) : null;
		},
		title() {
			return "Feed";
		},
	}),
};

export const feedGroupSearchParam = new Router.SearchParam("group");
export const postSearchParam = new Router.SearchParam("post");
