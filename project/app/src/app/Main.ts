import { awaited, computed, tags } from "@purifyjs/core";
import { PostPage } from "~/app/feed/PostPage";
import { postSearchParam } from "~/app/feed/routes";
import { router } from "~/app/router";
import { menuSearchParam } from "~/app/routes";
import { layoutBrakpoint } from "~/app/styles";
import { BackSvg } from "~/assets/svgs/BackSvg";
import { CloseSvg } from "~/assets/svgs/CloseSvg";
import { Post } from "~/features/feed/lib/Post";
import { config } from "~/shared/config";
import { css, useScope } from "~/shared/css";

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
									PostPage(post),
								);
						}),
					),
			),
		);
}

export const MainCss = css`
	:scope {
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

		padding-block: 1em;
		padding-inline: 0.75em;

		background-color: color-mix(in srgb, var(--base), var(--pop) 5%);

		&.route {
			flex: 1.5;
		}

		&.post {
			flex: 1;
		}
	}

	section header {
		display: block grid;
		grid-template-columns: 1.5em auto;
		align-items: center;
		gap: 1em;

		.icon {
			border-radius: 50%;
			aspect-ratio: 1;
			color: color-mix(in srgb, var(--base), var(--pop) 50%);
		}

		&:has(.back) {
			@container (inline-size >= ${layoutBrakpoint}) {
				grid-template-columns: auto;
			}
		}

		.back {
			@container (inline-size >= ${layoutBrakpoint}) {
				display: none;
			}
		}

		strong {
			font-size: 1.1em;
		}
	}
`;
