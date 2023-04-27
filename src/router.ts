import { homeLayout } from "@/pages/home"
import { unknownLayout } from "@/pages/unknown"
import { route, routeHref } from "@/route"
import { Address } from "@/utils/address"
import { $ } from "master-ts/library/$"
import type { Component } from "master-ts/library/component"
import type { SignalWritable } from "master-ts/library/signal"
import { searchLayout } from "./pages/search"
import { userLayout } from "./pages/user"

export type Layout = {
	top: Component | null
	page: Component
}

export function createLayout<T extends Record<PropertyKey, any>>(
	factory: (params: { [K in keyof T]: SignalWritable<T[K]> }) => Layout
) {
	let cache: Layout | null = null
	let paramsSignal: { [K in keyof T]: SignalWritable<T[K]> }
	return (params: T) =>
		cache
			? (Object.keys(params).forEach((key) => (paramsSignal[key]!.ref = params[key])), cache)
			: (cache = factory(
					(paramsSignal = Object.fromEntries(
						Object.entries(params).map(([key, value]) => [key, $.writable(value)])
					) as {
						[K in keyof T]: SignalWritable<T[K]>
					})
			  ))
}

export const routerLayout = $.readable<Layout>((set) => {
	const sub = route.path.subscribe(
		(path) => {
			if (path === "") {
				set(homeLayout({}))
			} else if (path === "search") {
				set(searchLayout({}))
			} else if (path === "top") {
				set(searchLayout({}))
			} else if (path.startsWith("0x") && path.length >= 42) {
				const [address, tab] = path.split("/") as [string, string | undefined]
				const userAddress = Address(address)
				switch (tab) {
					case "posts":
					case "replies":
					case "mentions":
						set(userLayout({ userAddress, tab }))
						location.replace(routeHref({ path: `${userAddress}/${tab}` }))
						break
					default:
						set(userLayout({ userAddress, tab: "posts" }))
						location.replace(routeHref({ path: `${userAddress}/posts` }))
						break
				}
			} else {
				set(unknownLayout({}))
			}
		},
		{ mode: "immediate" }
	)

	return () => {
		console.log("unsub")
		sub.unsubscribe()
	}
})
