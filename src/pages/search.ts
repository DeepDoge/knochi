import { SearchSvg } from "@/assets/svgs/search"
import { ProfileUI } from "@/components/profile"
import { TimelineUI } from "@/components/timeline"
import { commonStyle } from "@/import-styles"
import { route, routeHash } from "@/router"
import { createLayout } from "@/routes"
import { Address } from "@/utils/address"
import { Timeline } from "@/utils/timeline"
import { derive, fragment, signal } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { defer } from "master-ts/extra/defer"
import { html } from "master-ts/extra/html"
import { match } from "master-ts/extra/match"

const searchPageTag = defineCustomTag("x-search-layout-page")
export const searchLayout = createLayout<{ search: string }>((params) => {
	const root = searchPageTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	const searchInput = signal("")
	params.search.follow$(root, (search) => (searchInput.ref = search), { mode: "immediate" })
	const searchInputDeferred = defer(searchInput)
	searchInputDeferred.follow$(root, (search) => {
		const href = routeHash({ path: ["search", encodeURIComponent(search)].filter(Boolean).join("/") })
		if (route.pathArr.ref[0] === "search") location.replace(href)
		else location.assign(href)
	})
	const searchInputDeferredAndTrimmed = derive(() => searchInputDeferred.ref.trim())

	const searchResults = derive<{ timeline: Timeline; address: Address | null } | null>(() => {
		const search = searchInputDeferredAndTrimmed.ref
		if (!search) return null
		if (Address.isAddress(search)) return { timeline: Timeline.create({ mention: search, author: search, replies: "include" }, "or"), address: search }
		return { timeline: Timeline.create({ search: search.split(/\s+/), replies: "include" }), address: null }
	})

	dom.append(
		fragment(html`
			<div class="search input">
				<x ${SearchSvg()} class="icon"></x>
				<input type="text" class="ghost" bind:value=${searchInput} placeholder="Search anything" />
			</div>
			${match(searchResults)
				.case(null, () => html`<p class="none">...</p>`)
				.default((results) => {
					const address = derive(() => results.ref.address)
					const timeline = derive(() => results.ref.timeline)
					return html`
						<p>
							<span class="result-title">Search results for:</span>
							<span class="result-text">${searchInputDeferredAndTrimmed}</span>
						</p>
						${match(address)
							.case(null, () => null)
							.default((address) => ProfileUI(address))}
						<x ${TimelineUI(timeline)} class="timeline"></x>
					`
				})}
		`)
	)

	return {
		top: null,
		page: root,
	}
})

const style = css`
	:host {
		display: grid;
		gap: var(--span);
	}

	.search {
		display: grid;
		grid-template-columns: 1em 1fr;
		gap: var(--span);
	}

	.none {
		display: grid;
		place-items: center;
		opacity: 0.6;
		font-style: italic;
	}

	.result-title {
		color: hsl(var(--base-text--hsl), 0.65);
	}
	.result-text {
		color: hsl(var(--base-text--hsl), 0.65);
		font-style: italic;
	}
`
