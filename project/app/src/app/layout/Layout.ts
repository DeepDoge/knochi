import "~/app/styles.ts";

import { tags } from "@purifyjs/core";
import { Header } from "~/app/layout/header/Header.ts";
import { Main } from "~/app/layout/Main.ts";
import { menuSearchParam } from "~/app/layout/routes";
import { layoutBrakpoint } from "~/app/styles.ts";
import { css, useScope } from "~/shared/css.ts";
import { usePart } from "~/shared/effects/usePart.ts";

const { div } = tags;

const documentScroller = document.scrollingElement ?? document.body;

export function Layout() {
	const mainElement = Main().element;

	return div()
		.id("app")
		.effect(useScope(LayoutCss))
		.children(Header().effect(usePart("header")), mainElement)
		.effect((appElement) => {
			function scroll(isOpen: boolean, behavior: ScrollBehavior) {
				const left = isOpen ? 0 : Number.MAX_SAFE_INTEGER;
				appElement.scrollTo({ left, behavior });
			}

			function getScrollProgress() {
				return Math.max(
					0,
					Math.min(
						1,
						appElement.scrollLeft / (appElement.scrollWidth - appElement.clientWidth),
					),
				);
			}

			function getIsOpen(searchParam = menuSearchParam.val) {
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
				const isStatic =
					scrollProgress === 1 || appElement.scrollWidth === appElement.clientWidth;

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
					mainElement.style.blockSize = "100dvb";
					mainElement.scrollTop = scrollY;
					isStaticCache = false;
				}

				return isStatic;
			}

			handleResize();
			const unfollowMenuSearchParam = menuSearchParam.follow((param) =>
				scroll(getIsOpen(param), "smooth"),
			);

			window.addEventListener("resize", handleResize);
			function handleResize() {
				const isOpen = updateStaticState() ? updateIsOpen() : getIsOpen();
				scroll(isOpen, "instant");
			}

			appElement.addEventListener("scrollend", handleScrollEnd);
			function handleScrollEnd() {
				const isOpen = updateIsOpen();
				scroll(isOpen, "smooth");
			}

			appElement.addEventListener("scroll", handleScroll);
			function handleScroll() {
				updateStaticState();
			}

			return () => {
				unfollowMenuSearchParam();
				window.removeEventListener("resize", handleResize);
				appElement.removeEventListener("scrollend", handleScrollEnd);
				appElement.removeEventListener("scroll", handleScroll);
			};
		});
}

const LayoutCss = css`
	:scope {
		isolation: isolate;

		display: block grid;
		align-items: start;
		grid-template-columns: minmax(0, 20em) 1fr;
		grid-template-rows: auto;

		@container body (inline-size < ${layoutBrakpoint}) {
			overflow: overlay;
			grid-template-columns: 100% 100%;

			&::-webkit-scrollbar {
				display: none;
			}

			[data-part="header"] {
				animation: hide-header-scroll linear;
				animation-timeline: scroll(x);
				z-index: -1;
			}

			@keyframes hide-header-scroll {
				to {
					scale: 0.95;
					translate: 100% 0;
				}
			}
		}
	}

	[data-part="header"] {
		position: sticky;
		inset-block-start: 0;
		block-size: 100dvb;

		overflow: clip;
	}
`;
