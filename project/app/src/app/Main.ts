import { tags } from "@purifyjs/core";
import { router } from "~/app/router";
import { PostForm } from "~/features/post/components/PostForm";

const { main } = tags;

export function Main() {
	return main().children(
		PostForm(),
		router.route.derive((route) => {
			return route?.render() ?? null;
		}),
	);
}
