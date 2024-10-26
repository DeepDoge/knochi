import { feedRoutes } from "~/app/feed/routes";
import { profileRoutes } from "~/app/profile/routes";
import { Router } from "~/lib/router/mod";

export const router = new Router({
	...profileRoutes,
	...feedRoutes,
});
