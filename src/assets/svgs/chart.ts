import { html } from "master-ts/library/template"

export function ChartSvg() {
	return html`
		<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
			<path fill="currentColor" d="M5 19h-4v-4h4v4zm6 0h-4v-8h4v8zm6 0h-4v-13h4v13zm6 0h-4v-19h4v19zm1 2h-24v2h24v-2z" />
		</svg>
	`[0]!
}
