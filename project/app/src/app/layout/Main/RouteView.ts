import { Signal, tags } from "@purifyjs/core";
import { menuSearchParam } from "~/app/layout/routes";
import { router } from "~/app/router";
import { layoutBreakpoint } from "~/app/styles";
import { BackSvg } from "~/shared/svgs/BackSvg";
import { css, useScope } from "~/shared/utils/css";

const { section, header, a, div } = tags;

export function RouteView(route: Signal<NonNullable<typeof router.route.val>>) {
	return section({ class: "route" })
		.effect(useScope(RouteViewCss))
		.ariaLabel(route.derive((route) => route.title))
		.children(
			header().children(
				a({ class: "icon back" })
					.ariaHidden("true")
					.href(menuSearchParam.toHref("open"))
					.children(BackSvg()),
				route.derive((route) => route.renderHeader()),
			),
			div({ class: "contents" }).children(route.derive((route) => route.render())),
		);
}

export const RouteViewCss = css`
	:scope {
		display: block grid;
		gap: 1em;
		align-content: start;
		isolation: isolate;
	}

	.contents {
		z-index: -1;
	}

	header {
		position: sticky;
		inset-block-start: 0;

		display: block flex;
		align-items: center;
		gap: 1em;

		background-color: color-mix(in srgb, var(--base), var(--pop) 2.5%);
		padding-inline: 1em;
		padding-block: 1.25em;
		margin-inline: 0.5em;
		margin-block-start: 0.5em;

		.icon {
			inline-size: 1.5em;
			border-radius: 50%;
			aspect-ratio: 1;
			color: color-mix(in srgb, var(--base), var(--pop) 50%);

			@container body (inline-size >= ${layoutBreakpoint}) {
				display: none;
			}
		}

		strong {
			font-size: 1.1em;
		}
	}
`;
