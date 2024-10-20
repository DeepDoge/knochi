import "./styles";

import { tags } from "@purifyjs/core";
import { Header } from "~/app/Header";
import { router } from "~/app/router";
import { FeedViewer } from "~/features/post/components/FeedViewer";
import { PostForm } from "~/features/post/components/PostForm";
import { Feed } from "~/features/post/lib/Feed";
import { config } from "~/lib/config";
import { Router } from "~/lib/router/mod";
import { css, scope } from "../lib/css";

const { div, main } = tags;

const documentScroller = document.scrollingElement ?? document.body;
const menuSearchParam = new Router.SearchParam<"open">("menu");

export function Layout() {
	let mainElement: HTMLElement;

	return div()
		.id("app")
		.use(scope(LayoutCss))
		.use((element) => {
			function scroll(isOpen: boolean, behavior: ScrollBehavior) {
				const left = isOpen ? 0 : Number.MAX_SAFE_INTEGER;
				element.scrollTo({ left, behavior });
			}

			function getScrollProgress() {
				return Math.max(0, Math.min(1, element.scrollLeft / (element.scrollWidth - element.clientWidth)));
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
					mainElement.style.blockSize = "100dvb";
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
		.children(
			Header(),
			(mainElement = main().children(
				PostForm(),
				router.route.derive((route) => {
					if (route?.name !== "profile") return null;
					return FeedViewer(
						new Feed({
							id: Feed.Id.fromAddress(route.data.address),
							direction: -1n,
							limit: 1,
							chainIds: Object.values(config.val.networks).map((network) => network.chainId),
						}),
					);
				}),
				new Array(1024).fill("content "),
			).element),
		);
}

const LayoutCss = css`
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

			overflow: overlay;
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
			translate: 100% 0;
		}
	}

	header {
		grid-row: 1;
		grid-column: header;

		position: sticky;
		inset-block-start: 0;
		block-size: 100dvb;

		overflow: clip;
	}

	main {
		grid-row: 1;
		grid-column: main;

		min-block-size: 100dvb;

		padding-inline: 1em;
		padding-block: 1em;

		background-color: var(--base);
	}
`;
