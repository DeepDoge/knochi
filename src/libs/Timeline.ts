import { globalSheet } from "@/styles"
import { css, customTag, populate, sheet, tags } from "cherry-ts"

const { div, span } = tags

const timelineTag = customTag("x-timeline")
export function Timeline() {
	const root = timelineTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(timelineSheet, globalSheet)

	populate(dom, [])

	return root
}

const timelineSheet = sheet(css``)
