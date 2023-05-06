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
					<a href="#" class:active=${() => firstPartOfPath.ref === ""} aria-label="home" title="Home">
						${$.match(firstPartOfPath)
							.case("", () => html`<x ${HomeFilledSvg()} class="icon"></x>`)
							.default(() => html`<x ${HomeOutlineSvg()} class="icon"></x>`)}
					</a>
				</li>
				<li>
					<a href="#search" class:active=${() => firstPartOfPath.ref === "search"} aria-label="search" title="Search">
						<x ${SearchSvg()} class="icon"></x>
					</a>
				</li>
				<li>
					<a href="#top" class:active=${() => firstPartOfPath.ref === "top"} aria-label="top posts" title="Top Posts">
						${$.match(firstPartOfPath)
							.case("top", () => html`<x ${ChartFilledSvg()} class="icon"></x>`)
							.default(() => html`<x ${ChartOutlineSvg()} class="icon"></x>`)}
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

		& > ul {
			background: hsl(var(--background-hsl), 50%);
			backdrop-filter: blur(20px);
			border: solid 1px hsl(var(--base-hsl));
			border-bottom: none;
			contain: paint;
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

	ul {
		list-style: none;

		display: grid;
		grid-auto-flow: column;
		padding: 0;

		& > li {
			display: grid;
			grid-auto-flow: column;

			& > * {
				display: grid;
				align-items: center;
				padding: calc(var(--span) * 0.5) calc(var(--span) * 0.95);

				&.active {
					background-color: hsl(var(--master-text-hsl), 15%);
				}
			}
		}

		& .icon {
			height: min(1.5em, 5vh);
			color: hsl(var(--base-text-hsl));
		}
	}

	.profile {
		font-size: 0.85em;
	}
`
