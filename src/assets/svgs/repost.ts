import { html } from "master-ts/library/template"

export function RepostSvg() {
	return html`
		<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
			<path fill="currentColor" d="M5 10v7h10.797l1.594 2h-14.391v-9h-3l4-5 4 5h-3zm14 4v-7h-10.797l-1.594-2h14.391v9h3l-4 5-4-5h3z" />
		</svg>
	`[0] as SVGElement
}
