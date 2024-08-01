import { html } from "~/utils/html";

export function PreloadSvg(size = "100%") {
	return html`
		<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
			<circle fill="currentColor" stroke="currentColor" stroke-width="15" r="15" cx="40" cy="100">
				<animate
					attributeName="opacity"
					calcMode="spline"
					dur="2"
					values="1;0;1;"
					keySplines=".5 0 .5 1;.5 0 .5 1"
					repeatCount="indefinite"
					begin="-.4"></animate>
			</circle>
			<circle fill="currentColor" stroke="currentColor" stroke-width="15" r="15" cx="100" cy="100">
				<animate
					attributeName="opacity"
					calcMode="spline"
					dur="2"
					values="1;0;1;"
					keySplines=".5 0 .5 1;.5 0 .5 1"
					repeatCount="indefinite"
					begin="-.2"></animate>
			</circle>
			<circle fill="currentColor" stroke="currentColor" stroke-width="15" r="15" cx="160" cy="100">
				<animate
					attributeName="opacity"
					calcMode="spline"
					dur="2"
					values="1;0;1;"
					keySplines=".5 0 .5 1;.5 0 .5 1"
					repeatCount="indefinite"
					begin="0"></animate>
			</circle>
		</svg>
	`.firstElementChild as SVGSVGElement;
}
