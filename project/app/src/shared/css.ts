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

const scopeIdCache = new WeakMap<String, string>();
export function useScope(cssRef: String): Lifecycle.OnConnected {
	return (element) => {
		let scopeId = scopeIdCache.get(cssRef);
		if (!scopeId) {
			scopeId = Math.random().toString(36).slice(2);
			scopeIdCache.set(cssRef, scopeId);
			// this still doesnt require you to use [data-part] selector and might leak, but im gonna solve this later, not a concern atm.
			document.adoptedStyleSheets.push(
				sheet(css`
					@scope ([data-scope="${scopeId}"]) to ([data-part] > *, [data-scope]:not([data-part])) {
						${cssRef}
					}
				`),
			);
		}
		element.dataset.scope = scopeId;
	};
}
