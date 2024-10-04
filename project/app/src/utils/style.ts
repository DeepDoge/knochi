import { Enhanced } from "purify-js";

export const css = String.raw;

export function sheet(css: string) {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(css);
	return sheet;
}

export function scope(css: string): Enhanced.OnConnected {
	return (element) => {
		if (element.dataset["scope"]) return;

		const scopeId = Math.random().toString(36).slice(2);
		document.adoptedStyleSheets.push(sheet(`@scope ([data-scope="${scopeId}"]) to ([data-scope]) {${css}}`));
		element.dataset["scope"] = scopeId;
	};
}
