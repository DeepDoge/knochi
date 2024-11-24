import { Route, Router } from "~/shared/router";

export const menuSearchParam = new Router.SearchParam<"open">("menu");

export type UnknownRouteData = Record<PropertyKey, never>;
export class UnknownRoute extends Route<UnknownRouteData> {
	constructor() {
		super("", {});
	}

	public override title() {
		return "Unknown";
	}

	public override renderHeader() {
		return "Unknown";
	}

	public override render() {
		return "Unknown";
	}
}
