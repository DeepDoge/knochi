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
				sw: "./public/sw.js" /* processed again by Vite and its rules */,
			},
			output: {
				entryFileNames: (assetInfo) => {
					return assetInfo.name === "sw" ? "[name].js" : "app.[name].js";
				},
			},
		},
	},
	resolve: {
		alias: { "@": "/src" },
	},
});
