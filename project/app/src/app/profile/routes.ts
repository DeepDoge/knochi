import { ProfileView } from "~/app/profile/ProfileView";
import { Router } from "~/shared/router/mod";
import { Address } from "~/shared/solidity/primatives";

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
