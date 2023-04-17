import { route } from "@/route"
import { $ } from "master-ts/library/$"
import type { Component } from "master-ts/library/component"
import { HomePage } from "./pages/home"
import { UnknownPage } from "./pages/unknown"
import { UserPage } from "./pages/user"
import { address } from "./utils/address"

export const PageRouter = $.readable<Component | null>(null, (set) => {
	return route.page.subscribe(
		(path) => {
			if (path === "") {
				set(HomePage())
			} else if (path.startsWith("0x") && path.length === 42) {
				set(UserPage(address(path)))
			} else {
				set(UnknownPage())
			}
		},
		{ mode: "immediate" }
	).unsubscribe
})
