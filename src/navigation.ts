import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"
import { ChartSvg } from "./assets/svgs/chart"
import { HomeSvg } from "./assets/svgs/home"
import { SearchSvg } from "./assets/svgs/search"
import { GlowEffect } from "./libs/effects/glow"

const NavigationComponent = defineComponent("x-navigation")
export function Navigation() {
	const component = new NavigationComponent()

	component.$html = html`
		<nav>
			${GlowEffect()}
			<ul>
				<li>
					<a href="#" class="active" aria-label="home" title="Home">
						<x ${HomeSvg()} class="icon"></x>
					</a>
				</li>
				<li>
					<a href="#" aria-label="search" title="Search">
						<x ${SearchSvg()} class="icon"></x>
					</a>
				</li>
				<li>
					<a href="#" aria-label="top posts" title="Top Posts">
						<x ${ChartSvg()} class="icon"></x>
					</a>
				</li>
			</ul>
		</nav>
	`

	return component
}

NavigationComponent.$css = css`
	nav {
		position: relative;
		background-color: hsl(var(--base-hsl));
		border: solid 1px hsl(var(--master-hsl));
		border-radius: var(--radius-fab);

		& > ul {
			list-style: none;
			padding: calc(var(--span) * 0.75) calc(var(--span) * 1.5);

			display: grid;
			grid-auto-flow: column;
			align-items: center;
			gap: calc(var(--span) * 1.5);

			& .icon {
				height: min(1.75em, 5vh);
				color: hsl(var(--base-text-hsl));
			}

			& .active .icon {
				color: hsl(var(--master-hsl));
			}
		}
	}
`
