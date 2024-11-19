import { computed, tags } from "@purifyjs/core";
import { PostThreadView } from "~/app/layout/Main/PostThreadView";
import { RouteView } from "~/app/layout/Main/RouteView";
import { router } from "~/app/router";
import { Post } from "~/features/post/Post";
import { postSearchParam } from "~/features/post/routes";
import { config } from "~/shared/config";
import { css, useScope } from "~/shared/utils/css";
import { usePart } from "~/shared/utils/effects/usePart";
import { match } from "~/shared/utils/signals/match";

const { main } = tags;

export function Main() {
	const host = main();

	return host.effect(useScope(MainCss)).children(
		match(router.route)
			.if((route) => route !== null)
			.then((route) => RouteView(route).effect(usePart("route")))
			.else(() => null),
		match(postSearchParam)
			.if((searchParam) => searchParam !== null)
			.then((searchParam) => {
				const postPromise = computed(() => ({
					searchParam: searchParam.val,
					config: config.val,
				})).derive(({ searchParam, config }) =>
					Post.loadWithSearchParam(searchParam, config),
				);

				return PostThreadView(postPromise).effect(usePart("post"));
			})
			.else(() => null),
	);
}

export const MainCss = css`
	:scope {
		container: main / inline-size;

		display: block flex;
		align-content: start;

		/* gap: 0.25em; */

		background-color: var(--base);
		min-block-size: 100dvb;
	}

	[data-part="route"] {
		flex: 1;
	}

	[data-part="post"] {
		position: sticky;
		inset-block-start: 0;
		inline-size: min(40em, 100%);
		block-size: 100dvb;

		overflow: auto;
		scrollbar-width: thin;

		background-color: color-mix(in srgb, var(--base), var(--pop) 1%);

		@container main (inline-size < 60em) {
			position: fixed;
			inset-block: 0;
			inset-inline-end: 0;
			inline-size: min(100%, 30em);
			box-shadow: 0 0 2em 1em color-mix(in srgb, transparent, var(--base) 65%);
		}
	}
`;
