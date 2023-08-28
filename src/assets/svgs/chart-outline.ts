import { html } from "master-ts/library/template/tags/html"

export function ChartOutlineSvg() {
	return html`
		<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
			<path fill="currentColor" d="M5 9v8h-2v-8h2zm2-2h-6v12h6v-12zm6-4v14h-2v-14h2zm2-2h-6v18h6v-18zm6 13v3h-2v-3h2zm2-2h-6v7h6v-7zm1 9h-24v2h24v-2z" />
		</svg>
	`.firstChild as SVGElement
}
