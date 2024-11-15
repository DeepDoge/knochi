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

const { section, main, header, a, strong } = tags;

export function Main() {
	return main()
		.effect(useScope(MainCss))
		.children(
			section({ class: "route" })
				.ariaLabel(router.route.derive((route) => route?.title() ?? null))
				.children(
					header().children(
						a({ class: "icon back" })
							.ariaHidden("true")
							.href(menuSearchParam.toHref("open"))
							.children(BackSvg()),
						router.route.derive((route) => {
							if (!route) return null;
							return strong().textContent(route.title());
						}),
					),
					router.route.derive((route) => {
						return route?.render() ?? null;
					}),
				),

			computed(() => ({ searchParam: postSearchParam.val, config: config.val })).derive(
				({ searchParam, config }) =>
					awaited(
						Post.loadWithSearchParam(searchParam, config).then((post) => {
							if (!post) return null;

							return section({ class: "post" })
								.role("complementary")
								.ariaLabel("Post")
								.children(
									header().children(
										a({ class: "icon close" })
											.ariaHidden("true")
											.href(postSearchParam.toHref(null))
											.children(CloseSvg()),
										router.route.derive((route) => {
											if (!route) return null;
											return strong().textContent("Post");
										}),
									),
									PostThread(post),
								);
						}),
					),
			),
		);
}

export const MainCss = css`
	:scope {
		container: main / inline-size;

		display: block flex;
		align-content: start;

		gap: 0.5em;

		background-color: var(--base);
		min-block-size: 100dvb;
	}

	section {
		display: block grid;
		gap: 1em;
		align-content: start;

		background-color: color-mix(in srgb, var(--base), var(--pop) 5%);

		&.route {
			flex: 1.5;

			&:has(a svg) {
				@container body (inline-size >= ${layoutBrakpoint}) {
					grid-template-columns: auto;

					a:has(svg) {
						display: none;
					}
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

			@container main (inline-size < 60em) {
				position: fixed;
				inset-block: 0;
				inset-inline-end: 0;
				inline-size: min(100%, 30em);
				box-shadow: 0 0 2em 1em color-mix(in srgb, transparent, var(--base) 65%);
			}
		}
	}

	section header {
		display: block grid;
		grid-template-columns: 1.5em auto;
		align-items: center;
		gap: 1em;

		a:has(svg) {
			border-radius: 50%;
			aspect-ratio: 1;
			color: color-mix(in srgb, var(--base), var(--pop) 50%);
		}

		strong {
			font-size: 1.1em;
		}
	}
`;
