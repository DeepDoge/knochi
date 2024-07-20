import { defineConfig } from "vite";

export default defineConfig({
	plugins: [],
	build: {
		target: "esnext",
		outDir: "../app/public",
		emptyOutDir: false,

		lib: {
			entry: ["./sw.ts"],
			formats: ["es"],
			name: "sw",
			fileName: "sw",
		},
		rollupOptions: {
			output: {
				inlineDynamicImports: true,
			},
		},
	},
	resolve: {
		alias: { "@": "" },
	},
});
