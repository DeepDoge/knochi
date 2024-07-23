import { defineConfig } from "vite";

export default defineConfig({
	plugins: [],
	build: {
		target: "esnext",
		outDir: "../../dist",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				app: "./index.html",
			},
			output: {
				entryFileNames: (assetInfo) => {
					return "[name].js";
				},
			},
		},
	},
	resolve: {
		alias: { "~": "/src" },
	},
});
