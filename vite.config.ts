// vite config
import { defineConfig } from "vite"

export default defineConfig({
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
