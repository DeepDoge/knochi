import { Enhanced } from "purify-js";
import { uniqueId } from "~/utils/unique";

declare global {
	interface DOMStringMap {
		scope?: string;
	}
}

export const css = String.raw;

export function sheet(css: string) {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(css);
	return sheet;
}

export function scopeCss(css: string): Enhanced.OnConnected {
	return (element) => {
		if (element.dataset.scope) return;

		const scopeId = uniqueId();
		document.adoptedStyleSheets.push(
			sheet(`@scope ([data-scope="${scopeId}"]) to ([data-scope]:not([data-scope="${scopeId}"]) > *) {${css}}`),
		);
		element.dataset.scope = scopeId;
	};
}
