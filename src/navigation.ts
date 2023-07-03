import { ChartFilledSvg } from "@/assets/svgs/chart-filled"
import { ChartOutlineSvg } from "@/assets/svgs/chart-outline"
import { HomeFilledSvg } from "@/assets/svgs/home-filled"
import { HomeOutlineSvg } from "@/assets/svgs/home-outline"
import { SearchSvg } from "@/assets/svgs/search"
import { route } from "@/router"
import { Wallet } from "@/utils/wallet"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"
import { ChainChangerButtonUI } from "./components/chain-changer-button"
import { MyWalletUI } from "./components/wallet"

const NavigationComponent = defineComponent("x-navigation")
export function Navigation() {
	const component = new NavigationComponent()

	const firstPartOfPath = $.derive(() => route.pathArr.ref[0])

	component.$html = html`
		<div class="left">
			<ul>
				<li>
					<x ${MyWalletUI()} class="profile" class:active=${() => firstPartOfPath.ref === Wallet.browserWallet.ref?.address}></x>
				</li>
			</ul>
		</div>

		<nav class="center">
			<ul>
				<li>
					<a href="#" class="icon" class:active=${() => firstPartOfPath.ref === ""} aria-label="home" title="Home">
						${$.match(firstPartOfPath)
							.case("", () => html`<x ${HomeFilledSvg()}></x>`)
							.default(() => html`<x ${HomeOutlineSvg()}></x>`)}
					</a>
				</li>
				<li>
					<a href="#search" class="icon" class:active=${() => firstPartOfPath.ref === "search"} aria-label="search" title="Search">
						<x ${SearchSvg()}></x>
					</a>
				</li>
				<li>
					<a href="#popular" class="icon" class:active=${() => firstPartOfPath.ref === "popular"} aria-label="top posts" title="Popular Posts">
						${$.match(firstPartOfPath)
							.case("popular", () => html`<x ${ChartFilledSvg()}></x>`)
							.default(() => html`<x ${ChartOutlineSvg()}></x>`)}
					</a>
				</li>
			</ul>
		</nav>

		<div class="right" class:hide=${() => !Wallet.browserWallet.ref}>
			<ul>
				<li>${ChainChangerButtonUI()}</li>
			</ul>
		</div>
	`

	return component
}

NavigationComponent.$css = css`
	:host {
		display: grid;
		justify-content: space-between;
		grid-template-columns: 1fr auto 1fr;
		gap: calc(var(--span) * 0.25);
	}

	:host > * {
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
`
