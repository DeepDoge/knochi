import { defineConfig } from "vite"
import { masterTsPlugin } from "master-ts-vite-plugin/plugin"
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
	plugins: [masterTsPlugin, viteSingleFile()],
	build: {
		target: "esnext",
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
})
