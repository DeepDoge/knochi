import { profileRoutes } from "~/app/profile/routes";
import { postRoutes } from "~/features/post/routes";
import { Router } from "~/lib/router/mod";

export const router = new Router({
	...profileRoutes,
	...postRoutes,
});
