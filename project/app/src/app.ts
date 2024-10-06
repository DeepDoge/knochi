import "./styles";

import { tags } from "purify-js";
import { Header } from "~/Header";
import { SearchParamsSignal } from "./features/router/url";
import { css, scopeCss } from "./utils/style";

const { div, main } = tags;

const documentScroller = document.scrollingElement ?? document.body;

export const menuSearchParam = new SearchParamsSignal("menu");

function App() {
	let mainScrollActive = true;

	let mainElement: HTMLElement;

	return div()
		.id("app")
		.use(scopeCss(AppCss))
		.use((element) => {
			scroll(menuSearchParam.val, "instant");
			element.addEventListener("scrollend", scrollEndHandler);
			function scrollEndHandler() {
				const scrollProgress = Math.min(1, element.scrollLeft / (element.scrollWidth - element.clientWidth));

				scroll((menuSearchParam.val = scrollProgress < 0.5 ? "open" : null));

				const atActivationFrame = scrollProgress === 1;
				if (atActivationFrame) {
					if (mainScrollActive) return;
					const scrollY = mainElement.scrollTop;
					mainElement.style.overflow = "visible";
					mainElement.style.blockSize = "";
					documentScroller.scrollTop = scrollY;
					mainScrollActive = true;
				}

				if (!atActivationFrame) {
					if (!mainScrollActive) return;
					const scrollY = documentScroller.scrollTop;
					mainElement.style.overflow = "hidden";
					mainElement.style.blockSize = "100dvh";
					mainElement.scrollTop = scrollY;
					mainScrollActive = false;
				}
			}

			function scroll(menuSearchParam: string | null, behavior: ScrollBehavior = "smooth") {
				const left = menuSearchParam ? 0 : element.scrollWidth - element.clientWidth;
				if (left === element.scrollLeft) return;
				element.scrollTo({ left, behavior });
			}

			const unfollow = menuSearchParam.follow(scroll);

			return () => {
				unfollow();
				element.removeEventListener("scrollend", scrollEndHandler);
			};
		})
		.children(Header(), (mainElement = main().children(new Array(1024).fill("content ")).element));
}

const AppCss = css`
	:scope {
		isolation: isolate;

		display: block grid;
		align-items: start;
		grid-template-columns:
			[header-start]
			minmax(0, 20em)
			[header-end]
			2fr
			[main-start]
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
			&::-webkit-scrollbar {
				display: none; /* Safari and Chrome */
			}
			/* 
				snap breaks randomly if stuff changes at the middle of scrolling.
				also it would be better if i store the scrolling state on the url anyway
			*/
			/* scroll-snap-type: x mandatory; */

			main {
				/* scroll-snap-align: end; */
			}

			header {
				/* scroll-snap-align: start; */
				animation: hide-header-scroll linear;
				animation-timeline: scroll(x);
				z-index: -1;
			}
		}
	}

	@keyframes hide-header-scroll {
		to {
			scale: 0.95;
			translate: calc(100% + 1em) 0;
			/* opacity: 0; */
		}
	}

	header {
		grid-row: 1;
		grid-column: header;

		position: sticky;
		inset-block-start: 0;
		block-size: 100dvh;

		overflow: clip;
	}

	main {
		grid-row: 1;
		grid-column: main;

		background-color: var(--base);
	}
`;

document.body.append(App().element);
