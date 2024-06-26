import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";
import nodeResolve from "@rollup/plugin-node-resolve";
import path from "path";

/** @type { import('rollup').RollupOptions } */
export default {
	plugins: [nodeResolve(), dynamicImportVars()],
	input: path.join(String(import.meta.dirname), "/dist/sw.js"),
	output: {
		/* outputed into app/public so its accessable during `vite` dev */
		file: path.join(String(import.meta.dirname), "../app/public/sw.js"),
		format: "es",
		inlineDynamicImports: true,
	},
};
