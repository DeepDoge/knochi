import { postRoutes } from "~/features/post/routes";
import { profileRoutes } from "~/features/profile/routes";
import { Router } from "~/lib/router/mod";

export const router = new Router({
	...profileRoutes,
	...postRoutes,
});
