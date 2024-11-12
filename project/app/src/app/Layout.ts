import "./styles";

import { tags } from "@purifyjs/core";
import { Header } from "~/app/header/Header";
import { router } from "~/app/router";
import { BackSvg } from "~/assets/svgs/BackSvg";
import { Router } from "~/shared/router/mod";
import { css, useScope } from "../shared/css";

const { div, main, header, a, strong } = tags;

const documentScroller = document.scrollingElement ?? document.body;
const menuSearchParam = new Router.SearchParam<"open">("menu");

export function Layout() {
	const mainBuilder = main().children(
		header().children(
			a({ class: "back" })
				.ariaHidden("true")
				.href(menuSearchParam.toHref("open"))
				.children(BackSvg()),
			router.route.derive((route) => {
				if (!route) return null;
				return strong().textContent(route.title());
			}),
		),
		div({ class: "route" }).children(
			router.route.derive((route) => {
				return route?.render() ?? null;
			}),
		),
	);

	return div()
		.id("app")
		.effect(useScope(LayoutCss))
		.effect((element) => {
			function scroll(isOpen: boolean, behavior: ScrollBehavior) {
				const left = isOpen ? 0 : Number.MAX_SAFE_INTEGER;
				element.scrollTo({ left, behavior });
			}

			function getScrollProgress() {
				return Math.max(
					0,
					Math.min(1, element.scrollLeft / (element.scrollWidth - element.clientWidth)),
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
					scrollProgress === 1 || element.scrollWidth === element.clientWidth;

				if (isStatic === isStaticCache) return isStatic;

				if (isStatic) {
					const scrollY = mainBuilder.element.scrollTop;
					mainBuilder.element.style.overflow = "visible";
					mainBuilder.element.style.blockSize = "";
					documentScroller.scrollTop = scrollY;
					isStaticCache = true;
				} else {
					const scrollY = documentScroller.scrollTop;
					mainBuilder.element.style.overflow = "hidden";
					mainBuilder.element.style.blockSize = "100dvb";
					mainBuilder.element.scrollTop = scrollY;
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

		.children(Header(), mainBuilder);
}

const breakPoint = "45em";

const LayoutCss = css`
	:scope {
		isolation: isolate;

		display: block grid;
		align-items: start;
		grid-template-columns:
			[header-start]
			minmax(0, 20em)
			[header-end main-start]
			minmax(0, 40em)
			[main-end]
			1fr;
		grid-template-rows: auto;

		@container (inline-size < ${breakPoint}) {
			overflow: overlay;
			grid-template-columns:
				[header-start]
				100%
				[header-end main-start]
				100%
				[main-end];

			&::-webkit-scrollbar {
				display: none;
			}

			& > header {
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

	:scope > header {
		grid-row: 1;
		grid-column: header;

		position: sticky;
		inset-block-start: 0;
		block-size: 100dvb;

		overflow: clip;
	}

	:scope > main {
		grid-row: 1;
		grid-column: main;
		background-color: var(--base);
		padding-inline: 0.75em;
	}

	:scope > main > .route {
		min-block-size: 100dvb;
		padding-block: 1em;
	}

	:scope > main > header {
		display: grid;
		grid-template-columns: 1.5em auto;
		align-items: center;
		gap: 1em;
		padding-block: 1em;
		border-block-end: solid 1px color-mix(in srgb, var(--base), var(--pop) 10%);

		@container (inline-size >= ${breakPoint}) {
			grid-template-columns: auto;
		}

		.back {
			border-radius: 50%;
			aspect-ratio: 1;
			color: color-mix(in srgb, var(--base), var(--pop) 50%);

			@container (inline-size >= ${breakPoint}) {
				display: none;
			}
		}

		strong {
			font-size: 1.1em;
		}
	}
`;
