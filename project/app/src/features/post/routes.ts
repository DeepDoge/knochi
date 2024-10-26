import { string, tuple, union } from "zod";
import { Feed } from "~/features/post/lib/Feed";
import { Router } from "~/lib/router/mod";

export const postRoutes = {
	feed: new Router.Route({
		fromPathname(pathname) {
			return union([tuple([string()]), tuple([string(), Feed.Id()])])
				.transform(([groupId, feedId]) => {
					groupId ||= "~";
					return feedId ? { groupId, feedId } : { groupId };
				})
				.parse(pathname.split("/"));
		},
		toPathname(data) {
			return [data.groupId, data.feedId].filter(Boolean).join("/");
		},
		render() {
			return null;
		},
	}),
};
