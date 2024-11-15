import { ProfileView } from "~/features/profile/ProfileView";
import { config } from "~/shared/config";
import { Router } from "~/shared/router";
import { Address } from "~/shared/schemas/primatives";

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
			const { address } = data;
			return config.derive((config) => ProfileView({ address, config }));
		},
		title() {
			return "Profile";
		},
	}),
};
