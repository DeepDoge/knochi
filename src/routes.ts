import { route } from "@/route"
import { $ } from "master-ts/library/$"
import { Component, defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"
import { UnknownPage } from "./pages/unknown"
import { UserPage } from "./pages/user"
import { address } from "./utils/address"

const RoutesComponent = defineComponent("x-routes")
export function Routes() {
	const component = new RoutesComponent()

	const page = $.readable<Component | null>(null, (set) => {
		return route.page.subscribe(
			(path) => {
				if (path.startsWith("0x") && path.length === 42) {
					set(UserPage(address(path)))
				} else {
					set(UnknownPage())
				}
			},
			{ mode: "immediate" }
		).unsubscribe
	})

	component.$html = html`
		${page}
	`

	return component
}

RoutesComponent.$css = css`
	:host {
		display: contents;
	}
`
