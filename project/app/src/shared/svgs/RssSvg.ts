import { html } from "~/shared/utils/html";

export function RssSvg() {
	return html`
		<svg
			width="100%"
			viewBox="0 0 10 10"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink">
			<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
				<g transform="translate(-265.000000, -3644.000000)" fill="currentColor">
					<g transform="translate(56.000000, 160.000000)">
						<path
							d="M209,3492 L209,3494 L210.971803,3494 C210.971803,3492.895 210.089421,3492 209,3492 M209,3488 L209,3490 C210.971803,3490 213.08459,3492 213.08459,3494 L215.056394,3494 C215.056394,3491 211.957705,3488 209,3488 M219,3494 L217.028197,3494 C217.028197,3490 212.943606,3486 209,3486 L209,3484 C213.929508,3484 219,3488 219,3494"></path>
					</g>
				</g>
			</g>
		</svg>
	`.firstElementChild as SVGSVGElement;
}
