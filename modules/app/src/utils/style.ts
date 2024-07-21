export function style<const T extends string[]>(template: TemplateStringsArray, ...substitutions: T) {
	const sheet = new CSSStyleSheet();
	const css = String.raw(template, ...substitutions);
	sheet.replaceSync(css);

	return {
		sheet,
		...(Object.fromEntries(
			substitutions
				.filter((s) => (s.startsWith(".") || s.startsWith("#")) && s.length > 1)
				.map((s) => [s, s.slice(1)]),
		) as {
			[K in T[number] as K extends `${"." | "#"}${any}${any}` ? K : never]: K extends `${any}${infer Name}` ? Name
			:	never;
		}),
	};
}
