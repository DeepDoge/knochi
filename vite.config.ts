import typescript from "typescript"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import { masterTs } from "./node_modules/master-ts-vite-plugin/plugin"
import { parse } from "./node_modules/master-ts/library/template/parse"

export default defineConfig({
	plugins: [masterTs({ parse, typescript }), viteSingleFile()],
	build: {
		target: "esnext",
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
})
