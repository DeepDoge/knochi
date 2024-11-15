import { html } from "~/shared/utils/html";

export function CreateFolderSvg() {
	return html`
		<svg
			width="100%"
			viewBox="0 0 512 512"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink">
			<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
				<g fill="currentColor" transform="translate(42.666667, 85.333333)">
					<path
						d="M178.083413,1.42108547e-14 L232.041813,42.6666667 L426.666667,42.6666667 L426.666667,341.333333 L3.55271368e-14,341.333333 L3.55271368e-14,1.42108547e-14 L178.083413,1.42108547e-14 Z M234.666667,128 L192,128 L192,170.666667 L149.333333,170.666667 L149.333333,213.333333 L192,213.333333 L192,256 L234.666667,256 L234.666667,213.333333 L277.333333,213.333333 L277.333333,170.666667 L234.666667,170.666667 L234.666667,128 Z"></path>
				</g>
			</g>
		</svg>
	`.firstElementChild as SVGSVGElement;
}
