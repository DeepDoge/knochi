import { html } from "~/utils/html";

export function HomeSvg(options: { filled: boolean }) {
	return html`
		<svg width="100%" height="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
			<polygon
				stroke-width="30"
				stroke="${!options.filled ? "currentColor" : "transparent"}"
				fill="${options.filled ? "currentColor" : "transparent"}"
				points="192 0 0 153.6 0 384 149.333 384 149.333 256 234.667 256 234.667 384 384 384 384 153.6"
				transform="translate(64 64)" />
		</svg>
	`.firstElementChild as SVGSVGElement;
}
