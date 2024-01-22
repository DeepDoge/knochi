// vite config
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
	plugins: [viteSingleFile()],
	build: {
		target: "esnext",
		outDir: "dist",
	},
	resolve: {
		alias: {
			"@": "/src",
			"@contracts": "/contracts",
			"@graph": "/graph",
		},
	},
})
