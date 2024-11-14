import { feedRoutes } from "~/app/feed/routes.ts";
import { profileRoutes } from "~/app/profile/routes.ts";
import { Router } from "~/domains/router/mod.ts";

export const router = new Router.Client({
	...profileRoutes,
	...feedRoutes,
});
