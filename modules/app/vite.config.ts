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
				/* sw: "./service/sw.ts", */
			},
			output: {
				entryFileNames: (assetInfo) => {
					return /* assetInfo.name === "sw" ? "[name].js" :  */ "app.[name].js";
				},
			},
		},
	},
	resolve: {
		alias: { "@": "/src" },
	},
});
