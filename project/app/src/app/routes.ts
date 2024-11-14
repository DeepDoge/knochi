import { feedRoutes } from "~/app/feed/routes";
import { profileRoutes } from "~/app/profile/routes";
import { Router } from "~/shared/router/mod";

export const appRoutes = {
	...profileRoutes,
	...feedRoutes,
};
export const menuSearchParam = new Router.SearchParam<"open">("menu");
