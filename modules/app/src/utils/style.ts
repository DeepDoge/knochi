export function style(template: TemplateStringsArray, ...substitutions: unknown[]) {
	const sheet = new CSSStyleSheet();
	const className = `style-${Math.random().toString(36).slice(2)}`;
	const css = `.${className} { ${String.raw(template, ...substitutions)} }`;
	sheet.replaceSync(css);
	document.adoptedStyleSheets.push(sheet);

	return className;
}

export function createStyleBuilder() {
	let css = "";
	const sheet = new CSSStyleSheet();

	return {
		sheet,
		style(template: TemplateStringsArray, ...substitutions: unknown[]) {
			const className = `style-${Math.random().toString(36).slice(2)}`;
			css += `.${className} { ${String.raw(template, ...substitutions)} }`;
			sheet.replaceSync(css);

			return className;
		},
	};
}
