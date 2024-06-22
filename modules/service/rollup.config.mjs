import nodeResolve from "@rollup/plugin-node-resolve";
import path from "path";

export default {
	plugins: [nodeResolve()],
	input: path.join(String(import.meta.dirname), "/dist/sw.js"),
	output: {
		/* outputed into app/public so its accessable during `vite` dev */
		file: path.join(String(import.meta.dirname), "../app/public/sw.js"),
		format: "es",
	},
};
