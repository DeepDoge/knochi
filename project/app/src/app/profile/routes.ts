import { ProfileView } from "~/app/profile/ProfileView.ts";
import { Router } from "~/domains/router/mod.ts";
import { Address } from "~/shared/solidity/primatives.ts";

export const profileRoutes = {
	profile: new Router.Route({
		fromPathname(pathname) {
			return Address()
				.transform((address) => ({ address }))
				.parse(pathname);
		},
		toPathname(data) {
			return data.address;
		},
		render(data) {
			return ProfileView(data.address);
		},
		title() {
			return "Profile";
		},
	}),
};
