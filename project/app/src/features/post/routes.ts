import { Feed } from "~/features/post/lib/Feed";
import { Router } from "~/lib/router/mod";

export const postRoutes = {
	feed: new Router.Route({
		fromPathname(pathname) {
			return Feed.Id()
				.transform((id) => ({ id }))
				.parse(pathname.slice(1));
		},
		toPathname(data) {
			return `/${data.id}`;
		},
		render() {
			return null;
		},
	}),
};
