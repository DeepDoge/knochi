import { ChartFilledSvg } from "@/assets/svgs/chart-filled"
import { ChartOutlineSvg } from "@/assets/svgs/chart-outline"
import { HomeFilledSvg } from "@/assets/svgs/home-filled"
import { HomeOutlineSvg } from "@/assets/svgs/home-outline"
import { SearchSvg } from "@/assets/svgs/search"
import { route } from "@/router"
import { Wallet } from "@/utils/wallet"

import { css, customTag, derive, fragment, match, populate, sheet, tags } from "master-ts"
import { ChainChangerButtonUI } from "./components/chain-changer-button"
import { MyWalletUI } from "./components/wallet"
import { commonStyle } from "./import-styles"

const { div, ul, li, a, nav } = tags

const navigationTag = customTag("x-navigation")
export function Navigation() {
	const root = navigationTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const firstPartOfPath = derive(() => route.pathArr.ref[0])

	dom.append(
		fragment(
			div({ class: "left" }, [
				ul([li([populate(MyWalletUI(), { class: "profile", "class:active": () => firstPartOfPath.ref === Wallet.browserWallet.ref?.address })])]),
			]),

			nav({ class: "center" }, [
				ul([
					li([
						a({ href: "#", class: "icon", "class:active": () => firstPartOfPath.ref === "" }, [
							match(firstPartOfPath)
								.case("", () => HomeFilledSvg())
								.default(() => HomeOutlineSvg()),
						]),
					]),
					li([a({ href: "#search", class: "icon", "class:active": () => firstPartOfPath.ref === "search" }, [SearchSvg()])]),
					li([
						a({ href: "#popular", class: "icon", "class:active": () => firstPartOfPath.ref === "popular" }, [
							match(firstPartOfPath)
								.case("popular", () => ChartFilledSvg())
								.default(() => ChartOutlineSvg()),
						]),
					]),
				]),
			]),

			div({ class: "right", "class:hide": () => !Wallet.browserWallet.ref }, [ul([li([ChainChangerButtonUI()])])])
		)
	)

	return root
}

const style = sheet(css`
	:host {
		display: grid;
		justify-content: space-between;
		grid-template-columns: 1fr auto 1fr;
		gap: calc(var(--span) * 0.25);
	}

	:host > :is(div, nav) {
		display: grid;
		align-content: center;
		padding-bottom: calc(var(--span) * 0.25);

		--current--hsl: var(--background--hsl);
		--current-text--hsl: var(--background-text--hsl), 0.85;
		--current--backdrop-hsl: var(--primary--hsl);

		&.left {
			--current-text--hsl: var(--background-text--hsl);
			justify-content: start;
			& > ul {
				border-radius: 0 var(--radius-rounded) var(--radius-rounded) 0;
			}
		}
		&.center {
			& > ul {
				padding: calc(var(--span) * 0.5);
				border-radius: var(--radius-rounded);
			}
		}
		&.right {
			justify-content: end;
			& > ul {
				border-radius: var(--radius-rounded) 0 0 var(--radius-rounded);
			}
			&.hide {
				display: none;
			}
		}

		& > ul {
			backdrop-filter: blur(12px);
			contain: paint;

			background: hsl(var(--current--hsl), 60%);
			color: hsl(var(--current-text--hsl));
		}

		& > ul {
			list-style: none;
			padding: 0;

			display: grid;
			grid-auto-flow: column;
			align-items: center;

			& > li {
				display: grid;
				grid-auto-flow: column;

				& .icon {
					aspect-ratio: 1;

					display: grid;
					grid-template-columns: 1.5em;
					place-items: center;

					color: hsl(var(--current-text--hsl));

					border-radius: var(--radius);
				}

				& > * {
					padding: calc(var(--span) * 0.75);

					&:hover {
						background-color: hsl(var(--current--backdrop-hsl), 7.5%);
					}

					&.active {
						background-color: hsl(var(--current--backdrop-hsl), 15%);
					}
				}
			}
		}
	}

	.profile {
		font-size: 0.85em;
	}
`)
