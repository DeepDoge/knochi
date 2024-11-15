import eslint from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import projectStructurePlugin, { createIndependentModules } from "eslint-plugin-project-structure";
import tseslint from "typescript-eslint";

/**
 * @satisfies {Record<string, string[]>}>}
 */
const patterns = {
	app: ["src/app/**"],
	shared: ["src/shared/*/**"],
	features: ["src/features/*/**"],
	"feature:profile": ["src/features/profile/**"],
	"feature:post": ["src/features/post/**"],
	"feature:feed": ["src/features/feed/**"],
	family_3: ["{family_3}/**"],
};

/**
 * @type {{ [K in keyof typeof patterns]?: { allowImportsFrom: (keyof typeof patterns)[] } }}
 */
const boundaries = {
	app: {
		allowImportsFrom: ["app", "shared", "features"],
	},
	shared: {
		allowImportsFrom: ["shared"],
	},
	"feature:profile": {
		allowImportsFrom: ["feature:profile", "feature:feed", "shared"],
	},
	"feature:post": {
		allowImportsFrom: ["feature:post", "shared"],
	},
	"feature:feed": {
		allowImportsFrom: ["feature:feed", "feature:post", "shared"],
	},
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
						...Object.keys(boundaries).map((key) => ({
							name: key,
							pattern: patterns[key],
							allowImportsFrom: boundaries[key].allowImportsFrom
								.map((key) => patterns[key])
								.flat(),
						})),
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
