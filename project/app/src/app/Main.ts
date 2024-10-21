import { tags } from "@purifyjs/core";
import { router } from "~/app/router";

const { main } = tags;

export function Main() {
	return main().children(
		router.route.derive((route) => {
			return route?.render() ?? null;
		}),
	);
}
