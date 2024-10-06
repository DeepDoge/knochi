import "./styles";

import { tags } from "purify-js";
import { css, scopeCss } from "./utils/style";

const { div, header, main, footer } = tags;

function App() {
	return div().id("app").use(scopeCss(AppCss)).children(header(), main());
}

const AppCss = css`
	:scope {
		container-name: app;
		container-type: inline-size;

		min-block-size: 100svh;
		isolation: isolate;

		display: block grid;
		grid-template-columns:
			2fr
			[header-start]
			minmax(0, 25em)
			[header-end main-start]
			minmax(0, 50em)
			[main-end]
			4fr;
		grid-template-rows: auto;

		@container (inline-size < 55em) {
			grid-template-columns:
				[header-start]
				100%
				[header-end main-start]
				100%
				[main-end];

			overflow: auto;
			scroll-snap-type: x mandatory;
			header {
				scroll-snap-align: start;
			}
			main {
				scroll-snap-align: end;
			}
		}
	}

	header {
		grid-row: 1;
		grid-column: header;

		background-color: red;

		animation: hide-header-scroll linear;
		animation-timeline: scroll(x);
		z-index: -1;
	}

	@keyframes hide-header-scroll {
		to {
			scale: 0.95;
			translate: calc(100% + 1em) 0;
		}
	}

	main {
		grid-row: 1;
		grid-column: main;

		background-color: blue;
	}
`;

document.body.append(App().element);
