import { string, tuple, union } from "zod";
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
	group: new Router.Route({
		fromPathname(pathname) {
			return union([tuple([string(), Feed.Id()]), tuple([string()])])
				.transform(([groupId, feedId]) => (feedId ? { groupId, feedId } : { groupId }))
				.parse(pathname.slice(1).split("/"));
		},
		toPathname(data) {
			return data.feedId ? `/${data.groupId}/${data.feedId}` : `/${data.groupId}`;
		},
		render() {
			return null;
		},
	}),
};
