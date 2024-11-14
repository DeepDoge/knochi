import eslint from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import projectStructurePlugin, { createIndependentModules } from "eslint-plugin-project-structure";
import tseslint from "typescript-eslint";

const patterns = {
	features: ["src/features/*/**"],
	domains_export: ["src/domains/*/mod.ts"],
	domains: ["src/domains/*/**"],
	shared: ["src/assets/**", "src/shared/**"],
	app: ["src/app/**", "src/app.ts"],
};

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			"no-inner-declarations": "off",
			"no-undefined": "error",
		},
	},
	{
		plugins: { import: importPlugin },
		rules: {
			"import/extensions": ["error", "always", { ignorePackages: true }],
		},
	},
	{
		plugins: { "@typescript-eslint": typescriptPlugin },
		rules: {
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-this-alias": "off",
			"@typescript-eslint/no-wrapper-object-types": "off",
		},
	},
	{
		plugins: { "project-structure": projectStructurePlugin },
		rules: {
			"project-structure/independent-modules": [
				"error",
				createIndependentModules({
					pathAliases: {
						baseUrl: "./project/app",
						paths: {
							"~/*": ["src/*"],
						},
					},
					modules: [
						{
							name: "domains",
							pattern: patterns.domains,
							allowImportsFrom: [
								...patterns.shared,
								...patterns.domains_export,
								"{family_3}/**",
							],
						},
						{
							name: "features",
							pattern: patterns.features,
							allowImportsFrom: [
								...patterns.shared,
								...patterns.domains_export,
								"{family_3}/**",
							],
						},
						{
							name: "shared",
							pattern: patterns.shared,
							allowImportsFrom: [...patterns.shared],
						},
						{
							name: "app",
							pattern: patterns.app,
							allowImportsFrom: [
								...patterns.shared,
								...patterns.app,
								...patterns.features,
								...patterns.domains_export,
							],
						},
						{
							name: "unknown",
							pattern: "src/**",
							allowImportsFrom: [],
							allowExternalImports: false,
						},
					],
				}),
			],
		},
	},
);
