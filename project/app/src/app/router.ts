import { FeedRoute } from "~/features/feed/routes";
import { ProfileRoute } from "~/features/profile/routes";
import { Router } from "~/shared/router";

export const router = new Router.Client([ProfileRoute, FeedRoute]);
