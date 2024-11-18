import "~/app/styles";

import { tags } from "@purifyjs/core";
import { Header } from "~/app/layout/Header";
import { Main } from "~/app/layout/Main";
import { menuSearchParam } from "~/app/layout/routes";
import { layoutBreakpoint } from "~/app/styles";
import { css, useScope } from "~/shared/utils/css";
import { usePart } from "~/shared/utils/effects/usePart";

const { div } = tags;

export function Layout() {
	return div({ "data-menu": menuSearchParam })
		.id("app")
		.effect(useScope(LayoutCss))
		.children(Header().effect(usePart("header")), Main().effect(usePart("main")));
}

const LayoutCss = css`
	:scope {
		isolation: isolate;

		display: block grid;
		align-items: start;
		grid-template-columns: minmax(0, 20em) 1fr;
		grid-template-rows: auto;
	}

	[data-part="header"] {
		position: sticky;
		inset-block-start: 0;
		block-size: 100dvb;
		overflow: clip;
	}

	@container body (inline-size < ${layoutBreakpoint}) {
		:scope {
			position: relative;
			grid-template-columns: 1fr;
		}

		[data-part="header"],
		[data-part="main"] {
			grid-area: 1/1;
			transition: 0.5s ease-in-out;
		}

		[data-part="header"] {
			z-index: -1;
			transition-property: scale, opacity;
		}

		[data-part="main"] {
			transition-property: translate;
		}

		:scope[data-menu="open"] [data-part="main"] {
			translate: 100% 0;
		}

		:scope:not([data-menu="open"]) [data-part="header"] {
			scale: 0.95;
			opacity: 0.25;
		}
	}
`;
