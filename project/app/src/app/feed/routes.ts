import { FeedPage } from "~/app/feed/FeedPage";
import { Feed } from "~/features/feed/lib/Feed";
import { Router } from "~/shared/router/mod";

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
