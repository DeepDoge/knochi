import { html } from "~/shared/utils/html";

export function WalletSvg() {
	return html`
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="100%"
			viewBox="0 0 24 24"
			fill="currentColor">
			<g>
				<path
					d="M22 8.51V6.5A2.5 2.5 0 0 0 19.5 4h-15A2.5 2.5 0 0 0 2 6.5v11A2.5 2.5 0 0 0 4.5 20h15a2.5 2.5 0 0 0 2.5-2.5v-2c.6-.46 1-1.17 1-2v-3c0-.81-.4-1.53-1-2Zm-1 5a.5.5 0 0 1-.5.5H14c-1.1 0-2-.9-2-2s.9-2 2-2h6.5c.28 0 .5.22.5.5v3ZM19.5 18h-15a.5.5 0 0 1-.5-.5v-11c0-.28.22-.5.5-.5h15c.28 0 .5.22.5.5V8h-6a4 4 0 1 0 0 8h6v1.5a.5.5 0 0 1-.5.5Z"></path>
				<circle cx="14" cy="12" r="1"></circle>
			</g>
		</svg>
	`.firstElementChild as SVGSVGElement;
}
