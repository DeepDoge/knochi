import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const routesPath = path.join(__dirname, "../src/routes");
const outputFilePath = path.join(__dirname, "../src/routes.ts");
const files = await getFiles(routesPath);

const output = `export type Routes = {
${files
	.filter((filepath) => {
		const basename = path.basename(filepath);
		return basename === "+expose.ts";
	})
	.map((filepath) => {
		const key = filepath.slice(routesPath.length, -("+expose.ts".length + 1));
		return `${JSON.stringify(key)}: typeof import(${JSON.stringify(path.resolve(filepath))})`;
	})
	.join(",\n")}
}
`;

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
