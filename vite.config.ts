import { defineConfig } from "vite";

export default defineConfig({
	plugins: [],
	build: {
		target: "esnext",
		outDir: "dist",
		rollupOptions: {
			input: {
				app: "./index.html",
				sw: "./service/sw.ts",
			},
			output: {
				entryFileNames: (assetInfo) => {
					return assetInfo.name === "sw" ? "[name].js" : "app.[name].js";
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": "/src",
			"@contracts": "/contracts",
			"@service": "/service",
		},
	},
	worker: {
		format: "es",
	},
});
