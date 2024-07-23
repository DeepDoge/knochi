import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [],
	build: {
		target: "esnext",
		outDir: "../app/public",
		emptyOutDir: false,

		lib: {
			entry: ["./src/sw.ts"],
			formats: ["es"],
			name: "sw",
			fileName: "sw",
		},
		rollupOptions: {
			output: {
				inlineDynamicImports: true,
			},
			treeshake: true,
		},
	},
	resolve: {
		alias: { "~": path.resolve(__dirname, "./src") },
	},
});
