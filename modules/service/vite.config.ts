import { defineConfig } from "vite";
import dynamicImport from "vite-plugin-dynamic-import";

export default defineConfig({
	plugins: [dynamicImport({})],
	build: {
		target: "esnext",
		outDir: "../app/public",
		emptyOutDir: false,
		dynamicImportVarsOptions: {
			include: ["./src/api"],
			warnOnError: true,
		},
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
		},
	},
	resolve: {
		alias: { "@": "/src" },
	},
});
