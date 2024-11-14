import { appRoutes } from "~/app/routes";
import { Router } from "~/shared/router/mod";

export const router = new Router.Client(appRoutes);
