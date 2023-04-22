import { homeLayout } from "@/pages/home"
import { unknownLayout } from "@/pages/unknown"
import { route, routeHref } from "@/route"
import { Address } from "@/utils/address"
import { $ } from "master-ts/library/$"
import type { Component } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal/readable"
import type { SignalWritable } from "master-ts/library/signal/writable"
import { userLayout } from "./pages/user"

export type Layout = {
	top: Component | null
	page: Component
}

export function createLayout<T>(factory: (params: SignalReadable<T>) => Layout) {
	let cache: Layout | null = null
	let paramsSignal: SignalWritable<T>
	return (params: T) => (cache ? ((paramsSignal.ref = params), cache) : (cache = factory((paramsSignal = $.writable(params)))))
}

export const routerLayout = $.readable<Layout>((set) => {
	return route.path.subscribe(
		(path) => {
			if (path === "") {
				set(homeLayout())
			} else if (path.startsWith("0x") && path.length === 42) {
				const userAddress = Address(path)
				set(userLayout({ userAddress }))
				location.replace(routeHref({ path: userAddress }))
			} else {
				set(unknownLayout())
			}
		},
		{ mode: "immediate" }
	).unsubscribe
})
