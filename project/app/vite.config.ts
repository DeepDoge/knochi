import path from "node:path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
	plugins: [viteSingleFile()],
	build: {
		target: "esnext",
		emptyOutDir: true,
	},
	resolve: {
		alias: { "~": path.resolve(__dirname, "./src") },
	},
});
