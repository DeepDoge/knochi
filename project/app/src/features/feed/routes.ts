import { Router } from "~/shared/router";
import { FeedId } from "~/shared/schemas/feed";

export const feedRoutes = {
	feed: new Router.Route({
		fromPathname(pathname) {
			return FeedId()
				.transform((feedId) => ({ feedId }))
				.parse(pathname.split("/"));
		},
		toPathname(data: { feedId: FeedId }) {
			return data.feedId;
		},
		render(data) {
			return data.feedId;
			// return data.feedId ? FeedPage({ config }) : null;
		},
		title() {
			return "Feed";
		},
	}),
};

export const feedGroupSearchParam = new Router.SearchParam("group");
