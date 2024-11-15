import { feedRoutes } from "~/features/feed/routes";
import { profileRoutes } from "~/features/profile/routes";
import { Router } from "~/shared/router";

export const router = new Router.Client({
	...profileRoutes,
	...feedRoutes,
});
