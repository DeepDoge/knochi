import { route, routeHash } from "@/route"
import { $ } from "master-ts/library/$"
import type { Component } from "master-ts/library/component"
import { HomePage } from "./pages/home"
import { UnknownPage } from "./pages/unknown"
import { UserPage } from "./pages/user"
import { Address, address } from "./utils/address"

export const PageRouter = $.readable<Component | null>(null, (set) => {
	const userPageCache = $.writable<ReturnType<typeof UserPage> | null>(null)
	const userPageAddressCache = $.writable<Address>(null!)

	return route.path.subscribe(
		(path) => {
			if (path === "") {
				set(HomePage())
			} else if (path.startsWith("0x") && path.length === 42) {
				userPageAddressCache.ref = address(path)
				userPageCache.ref ??= UserPage(userPageAddressCache)
				set(userPageCache.ref)
				location.replace(routeHash({ path: userPageAddressCache.ref }))
			} else {
				set(UnknownPage())
			}
		},
		{ mode: "immediate" }
	).unsubscribe
})
