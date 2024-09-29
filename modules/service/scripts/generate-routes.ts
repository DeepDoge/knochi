import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const routesPath = path.join(__dirname, "../src/routes");
const outputFilePath = path.join(__dirname, "../src/routes.ts");
const files = (await getFiles(routesPath)).filter((filepath) => {
	const basename = path.basename(filepath);
	return basename === "+expose.ts";
});

const output = [
	files
		.map((filepath, index) => {
			const from = JSON.stringify(path.resolve(filepath).slice(0, -3));
			return `import type * as _${index} from ${from}`;
		})
		.join("\n"),
	[
		"export type Routes = {\n\t",
		files
			.map((filepath, index) => {
				const key = filepath.slice(routesPath.length, -("+expose.ts".length + 1));
				return `${JSON.stringify(key)}: typeof _${index}`;
			})
			.join(",\n\t"),
		"\n}",
	].join(""),
	[
		"export type {\n\t",
		files
			.map((filepath, index) => {
				const key = filepath.slice(routesPath.length + 1, -("+expose.ts".length + 1)).replaceAll("/", "_");
				return `_${index} as ${key}`;
			})
			.join(",\n\t"),
		"\n}",
	].join(""),
].join("\n\n");

fs.writeFileSync(outputFilePath, output, "utf-8");

async function getFiles(dir: string) {
	const result: string[] = [];

	const entries = await fs.promises.readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isFile()) {
			result.push(fullPath);
		} else if (entry.isDirectory()) {
			result.push(...(await getFiles(fullPath)));
		}
	}

	return result;
}
