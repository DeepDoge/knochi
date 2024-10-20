import { Router } from "~/lib/router/mod";
import { Address } from "~/lib/solidity/primatives";

export const profileRoutes = {
	profile: new Router.Route({
		fromPathname(pathname) {
			return Address()
				.transform((address) => ({ address }))
				.parse(pathname.slice(1));
		},
		toPathname(data) {
			return `/${data.address}`;
		},
	}),
};
