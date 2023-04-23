import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"
import { ChartSvg } from "./assets/svgs/chart"
import { HomeSvg } from "./assets/svgs/home"
import { SearchSvg } from "./assets/svgs/search"
import { Profile } from "./libs/profile"
import { route } from "./route"
import { Address } from "./utils/address"

const NavigationComponent = defineComponent("x-navigation")
export function Navigation() {
	const component = new NavigationComponent()

	component.$html = html`
		<x ${Profile($.derive(() => Address("0xE272C9a263701DAFFe940FB4ecEACFa9b2c1217D")))} class="profile"></x>

		<nav>
			<ul>
				<li>
					<a href="#" class:active=${() => route.path.ref === ""} aria-label="home" title="Home">
						<x ${HomeSvg()} class="icon"></x>
					</a>
				</li>
				<li>
					<a href="#search" class:active=${() => route.path.ref === "search"} aria-label="search" title="Search">
						<x ${SearchSvg()} class="icon"></x>
					</a>
				</li>
				<li>
					<a href="#top" class:active=${() => route.path.ref === "top"} aria-label="top posts" title="Top Posts">
						<x ${ChartSvg()} class="icon"></x>
					</a>
				</li>
			</ul>
		</nav>

		<div class="other">Other</div>
	`

	return component
}

NavigationComponent.$css = css`
	:host {
		display: grid;
		justify-content: space-between;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding-inline: var(--span);
		padding-bottom: calc(var(--span) * 0.5);
		gap: var(--span);

		background: linear-gradient(to top, hsl(var(--master-hsl), 25%), transparent);
	}

	.profile {
		font-size: 0.85em;
	}

	.other {
		display: grid;
		justify-content: end;
		align-items: center;
	}

	ul {
		list-style: none;

		display: grid;
		grid-auto-flow: column;
		align-items: center;

		& > li {
			display: grid;
			grid-auto-flow: column;

			& + li::before {
				content: "";
				border-left: solid hsl(var(--master-hsl)) 1px;
				padding-left: calc(var(--span) * 1);
			}
			&:has(+ *) {
				padding-right: calc(var(--span) * 1);
			}
		}

		& .icon {
			height: min(1.75em, 5vh);
			color: hsl(var(--base-text-hsl));
		}

		& .active .icon {
			color: hsl(var(--master-hsl));
		}
	}
`
