import "./styles";

import { tags } from "purify-js";
import { PostForm } from "~/features/post/PostForm";
import { Header } from "~/Header";
import { SearchParamsSignal } from "./features/router/url";
import { css, scopeCss } from "./utils/style";

const { div, main } = tags;

const documentScroller = document.scrollingElement ?? document.body;

export type MenuSearchParam = typeof menuSearchParam.val;
export const menuSearchParam = new SearchParamsSignal<"open">("menu");

function App() {
	let mainElement: HTMLElement;

	return div()
		.id("app")
		.use(scopeCss(AppCss))
		.use((element) => {
			function scroll(isOpen: boolean, behavior: ScrollBehavior) {
				const left = isOpen ? 0 : Number.MAX_SAFE_INTEGER;
				element.scrollTo({ left, behavior });
			}

			function getScrollProgress() {
				return Math.max(0, Math.min(1, element.scrollLeft / (element.scrollWidth - element.clientWidth)));
			}

			function getIsOpen(searchParam: MenuSearchParam = menuSearchParam.val) {
				return Boolean(searchParam);
			}

			function updateIsOpen() {
				const isStatic = updateStaticState();
				const scrollProgress = getScrollProgress();
				const isOpen = !isStatic && scrollProgress < 0.5;
				menuSearchParam.val = isOpen ? "open" : null;
				return isOpen;
			}

			let isStaticCache = true;
			function updateStaticState() {
				const scrollProgress = getScrollProgress();
				const isStatic = scrollProgress === 1 || element.scrollWidth === element.clientWidth;

				if (isStatic === isStaticCache) return isStatic;

				if (isStatic) {
					const scrollY = mainElement.scrollTop;
					mainElement.style.overflow = "visible";
					mainElement.style.blockSize = "";
					documentScroller.scrollTop = scrollY;
					isStaticCache = true;
				} else {
					const scrollY = documentScroller.scrollTop;
					mainElement.style.overflow = "hidden";
					mainElement.style.blockSize = "100dvh";
					mainElement.scrollTop = scrollY;
					isStaticCache = false;
				}

				return isStatic;
			}

			handleResize();
			const unfollowMenuSearchParam = menuSearchParam.follow((param) => scroll(getIsOpen(param), "smooth"));

			window.addEventListener("resize", handleResize);
			function handleResize() {
				const isOpen = updateStaticState() ? updateIsOpen() : getIsOpen();
				scroll(isOpen, "instant");
			}

			element.addEventListener("scrollend", handleScrollEnd);
			function handleScrollEnd() {
				const isOpen = updateIsOpen();
				scroll(isOpen, "smooth");
			}

			element.addEventListener("scroll", handleScroll);
			function handleScroll() {
				updateStaticState();
			}

			return () => {
				unfollowMenuSearchParam();
				window.removeEventListener("resize", handleResize);
				element.removeEventListener("scrollend", handleScrollEnd);
				element.removeEventListener("scroll", handleScroll);
			};
		})
		.children(Header(), (mainElement = main().children(PostForm(), new Array(1024).fill("content ")).element));
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
			minmax(0, 40em)
			[main-end]
			4fr;
		grid-template-rows: auto;

		@container (inline-size < 45em) {
			grid-template-columns:
				[header-start]
				100%
				[header-end main-start]
				100%
				[main-end];

			overflow: auto;
			&::-webkit-scrollbar {
				display: none;
			}

			header {
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

		min-block-size: 100dvh;

		padding-inline: 1em;
		padding-block: 1em;

		background-color: var(--base);
	}
`;

document.body.append(App().element);
