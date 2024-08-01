export function html(strings: TemplateStringsArray, ...args: string[]): DocumentFragment {
	const template = document.createElement("template");
	template.innerHTML = String.raw(strings, ...args);
	return template.content;
}
