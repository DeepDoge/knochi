import { Lifecycle } from "@purifyjs/core";

declare global {
	interface DOMStringMap {
		scope?: string;
	}
}

export function css(...params: Parameters<typeof String.raw>) {
	return new String(String.raw(...params));
}

const sheetCache = new WeakMap<String, CSSStyleSheet>();
export function sheet(cssRef: String) {
	let sheet = sheetCache.get(cssRef);
	if (!sheet) {
		sheet = new CSSStyleSheet();
		sheet.replaceSync(cssRef.toString());
		sheetCache.set(cssRef, sheet);
	}
	return sheet;
}

const cache = new WeakMap<Element, Set<String>>();
export function useScope(cssRef: String): Lifecycle.OnConnected {
	return (element) => {
		const scopeId = (element.dataset.scope ??= Math.random().toString(36).slice(2));

		let set = cache.get(element);
		if (!set) {
			set = new Set();
			cache.set(element, set);
		}

		if (set.has(cssRef)) return;

		const styleSheet = sheet(css`
			@scope ([data-scope="${scopeId}"]) to ([data-part] > *, [data-scope]:not([data-part])) {
				${cssRef}
			}
		`);
		document.adoptedStyleSheets.push(styleSheet);

		set.add(cssRef);
	};
}
