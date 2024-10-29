import { Profile } from "~/app/profile/Profile";
import { Router } from "~/lib/router/mod";
import { Address } from "~/lib/solidity/primatives";

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
			return Profile(data.address);
		},
		title() {
			return "Profile";
		},
	}),
};
