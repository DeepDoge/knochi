import { Wallet } from "@/api/wallet"
import { ChartFilledSvg } from "@/assets/svgs/chart-filled"
import { ChartOutlineSvg } from "@/assets/svgs/chart-outline"
import { HomeFilledSvg } from "@/assets/svgs/home-filled"
import { HomeOutlineSvg } from "@/assets/svgs/home-outline"
import { SearchSvg } from "@/assets/svgs/search"
import { route } from "@/router"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"
import { MyWallet } from "./libs/wallet"

const NavigationComponent = defineComponent("x-navigation")
export function Navigation() {
	const component = new NavigationComponent()

	const firstPartOfPath = $.derive(() => route.pathArr.ref[0])

	component.$html = html`
		<div class="left">
			<ul>
				<li>
					<x ${MyWallet()} class="profile" class:active=${() => firstPartOfPath.ref === Wallet.browserWallet.ref?.address}></x>
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

		<div class="right">
			<ul></ul>
		</div>
	`

	return component
}

NavigationComponent.$css = css`
	:host {
		display: grid;
		justify-content: space-between;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--span);
	}

	:host > * {
		display: grid;
		align-content: end;

		& > ul {
			list-style: none;
			padding: 0;

			display: grid;
			grid-auto-flow: column;
			align-items: center;

			border: solid 1px hsl(var(--base-hsl));
			border-bottom: none;

			backdrop-filter: blur(12px);
			contain: paint;

			--current-hsl: var(--background-hsl);
			--current-text-hsl: var(--background-text-hsl);

			background: hsl(var(--current-hsl), 50%);
			color: hsl(var(--current-text-hsl));

			& > li {
				display: grid;
				grid-auto-flow: column;

				& .icon {
					aspect-ratio: 1;

					display: grid;
					grid-template-columns: 1.5em;
					place-items: center;

					border-radius: var(--radius);
				}

				& > * {
					padding: calc(var(--span) * 0.75);
					&.active {
						background-color: hsl(var(--current-text-hsl), 15%);
					}
				}
			}
		}

		&.left {
			justify-content: start;
			& > ul {
				border-radius: 0 var(--radius-rounded) 0 0;
				border-left: none;
			}
		}
		&.center {
			& > ul {
				border-radius: var(--radius-rounded) var(--radius-rounded) 0 0;
				padding: calc(var(--span) * 0.25);
			}
		}
		&.right {
			justify-content: end;
			& > ul {
				border-radius: var(--radius-rounded) 0 0 0;
				border-right: none;
			}
		}
	}

	.profile {
		font-size: 0.85em;
	}
`
