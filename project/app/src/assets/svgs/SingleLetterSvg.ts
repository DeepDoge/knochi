import { html } from "~/shared/html.ts";

export function SingleLetterSvg<const T extends string>(
	letter: T extends `${infer L}${string}` ? L : T,
) {
	return html`
		<svg viewBox="0 0 100 100" width="100%" xmlns="http://www.w3.org/2000/svg">
			<text
				x="50"
				y="50"
				style="font-family:monospace;font-size:100px"
				fill="currentColor"
				text-anchor="middle"
				dominant-baseline="middle">
				${letter}
			</text>
		</svg>
	`.firstElementChild as SVGSVGElement;
}
