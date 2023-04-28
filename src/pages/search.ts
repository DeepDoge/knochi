import { getTimeline } from "@/api/graph"
import { SearchSvg } from "@/assets/svgs/search"
import { Timeline } from "@/libs/timeline"
import { routeHref } from "@/router"
import { createLayout } from "@/routes"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { css, html } from "master-ts/library/template"

export const searchLayout = createLayout<{ search: string }>((params) => {
	const PageComponent = defineComponent("x-search-layout-page")
	const page = new PageComponent()

	PageComponent.$css = css`
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
			opacity: 0.8;
		}
		.result-text {
			opacity: 0.6;
			font-style: italic;
		}
	`

	const searchInput = $.writable("")
	page.$subscribe(params.search, (search) => (searchInput.ref = search), { mode: "immediate" })
	const searchInputDeferred = $.deferred(searchInput)
	page.$subscribe(searchInputDeferred, (search) =>
		location.replace(routeHref({ path: ["search", search].filter(Boolean).join("/") }))
	)

	const timeline = $.derive(() => (params.search.ref ? getTimeline({ search: params.search.ref, replies: "include" }) : null))

	page.$html = html`
		<div class="search input">
			<x ${SearchSvg()} class="icon"></x>
			<input type="text" class="transparent-input" bind:value=${searchInput} placeholder="Search anything" />
		</div>
		${$.match(timeline)
			.case(null, () => html`<p class="none">...</p>`)
			.default(
				(timeline) => html`
					<p>
						<span class="result-title">Search results for:</span>
						<span class="result-text">${searchInputDeferred}</span>
					</p>
					<x ${Timeline(timeline)} class="timeline"></x>
				`
			)}
	`

	return {
		top: null,
		page,
	}
})
