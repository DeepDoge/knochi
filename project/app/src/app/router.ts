import { feedRoutes } from "~/app/feed/routes";
import { profileRoutes } from "~/app/profile/routes";
import { Router } from "~/shared/router/mod";

export const router = new Router.Client({
	...profileRoutes,
	...feedRoutes,
});
