export function style(template: TemplateStringsArray, ...substitutions: unknown[]) {
	const sheet = new CSSStyleSheet();
	const className = `style-${Math.random().toString(36).slice(2)}`;
	const css = `.${className} { ${String.raw(template, ...substitutions)} }`;
	sheet.replaceSync(css);
	document.adoptedStyleSheets.push(sheet);

	return className;
}
