import { awaited, computed, tags } from "@purifyjs/core";
import { menuSearchParam } from "~/app/layout/routes";
import { router } from "~/app/router";
import { layoutBrakpoint } from "~/app/styles";
import { PostThread } from "~/features/feed/components/PostThread";
import { Post } from "~/features/post/Post";
import { postSearchParam } from "~/features/post/routes";
import { config } from "~/shared/config";
import { BackSvg } from "~/shared/svgs/BackSvg";
import { CloseSvg } from "~/shared/svgs/CloseSvg";
import { css, useScope } from "~/shared/utils/css";
import { match } from "~/shared/utils/match";

// TODO: seperate route and post section into two different files later.

const { section, main, header, a, strong } = tags;

export function Main() {
	const host = main();

	return host.effect(useScope(MainCss)).children(
		match(router.route)
			.if((route) => route !== null)
			.then((route) =>
				section({ class: "route" })
					.ariaLabel(route.derive((route) => route.title))
					.children(
						header().children(
							a({ class: "icon back" })
								.ariaHidden("true")
								.href(menuSearchParam.toHref("open"))
								.children(BackSvg()),
							route.derive((route) => route.renderHeader()),
						),
						route.derive((route) => route.render()),
					),
			)
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

				return section({ class: "post" })
					.role("complementary")
					.ariaLabel("Post")
					.children(
						header().children(
							a({ class: "icon close" })
								.ariaHidden("true")
								.href(postSearchParam.toHref(null))
								.children(CloseSvg()),
							strong().textContent("Post"),
						),
						postPromise.derive((postPromise) => {
							return awaited(
								postPromise.then((post) => {
									if (!post) return null; // not found
									return PostThread(post);
								}),
								null, // loading
							);
						}),
					);
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

	section {
		display: block grid;
		gap: 1em;
		align-content: start;

		header {
			position: sticky;
			inset-block-start: 0;

			display: block flex;
			align-items: center;
			gap: 1em;

			background-color: color-mix(in srgb, var(--base), var(--pop) 2.5%);
			padding-inline: 1em;
			padding-block: 1.25em;

			.icon {
				inline-size: 1.5em;
				border-radius: 50%;
				aspect-ratio: 1;
				color: color-mix(in srgb, var(--base), var(--pop) 50%);
			}

			strong {
				font-size: 1.1em;
			}
		}

		&.route {
			flex: 1.5;

			header {
				margin-inline: 0.5em;
				margin-block-start: 0.5em;
			}

			@container body (inline-size >= ${layoutBrakpoint}) {
				header .icon {
					display: none;
				}
			}
		}

		&.post {
			inline-size: 30em;

			max-block-size: 100dvb;
			overflow: auto;
			scrollbar-width: thin;

			position: sticky;
			inset-block-start: 0;

			background-color: color-mix(in srgb, var(--base), var(--pop) 1%);

			@container main (inline-size < 60em) {
				position: fixed;
				inset-block: 0;
				inset-inline-end: 0;
				inline-size: min(100%, 30em);
				box-shadow: 0 0 2em 1em color-mix(in srgb, transparent, var(--base) 65%);
			}
		}
	}
`;
