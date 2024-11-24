import { Route, Router } from "~/shared/router";
import { FeedId } from "~/shared/schemas/feed";

export const feedGroupSearchParam = new Router.SearchParam("group");

export type FeedRouteData = { feedId: FeedId };
export class FeedRoute extends Route<FeedRouteData> {
	constructor(feedId: FeedId) {
		const pathname = feedId;
		const data = FeedRoute.parsePathname(pathname);
		super(pathname, data);
	}

	public static parsePathname(pathname: string): FeedRouteData {
		return FeedId()
			.transform((feedId) => ({ feedId }))
			.parse(pathname.split("/"));
	}

	public override title() {
		return "Feed";
	}

	public override renderHeader() {
		return "Feed";
	}

	public override render() {
		return this.data.feedId;
	}
}
