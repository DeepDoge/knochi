import { bold, green } from "console-log-colors"
import fs from "node:fs/promises"
import path from "node:path"
import { compileSol } from "solc-typed-ast"

const CONTRACTS_DIR = "./contracts"
const NODE_MODULES_DIR = "./node_modules"

async function findSolidityFilesRecursive(dir: string): Promise<string[]> {
	const files = await fs.readdir(dir, { withFileTypes: true })
	const solidityFiles = await Promise.all(
		files.map(async (file) => {
			const filePath = `${dir}/${file.name}`
			if (file.isDirectory()) {
				return await findSolidityFilesRecursive(filePath)
			} else if (file.isFile() && file.name.endsWith(".sol")) {
				return filePath
			}
		}),
	)
	return solidityFiles
		.flat()
		.filter(Boolean)
		.map((filePath) => path.resolve(filePath))
}

const solidityFiles = await findSolidityFilesRecursive(CONTRACTS_DIR)
const solidityFilesByDir = solidityFiles.reduce(
	(acc, filePath) => {
		const dirPath = path.dirname(filePath)
		;(acc[dirPath] ??= []).push(filePath)
		return acc
	},
	{} as Record<string, string[]>,
)

for (const [dirPath, solidityFiles] of Object.entries(solidityFilesByDir)) {
	const artifactsDirPath = path.resolve(`${dirPath}/artifacts`)
	await fs.rm(artifactsDirPath, { recursive: true }).catch(() => {})
	await fs.mkdir(artifactsDirPath, { recursive: true })
	for (const filePath of solidityFiles) {
		const name = path.basename(filePath, ".sol")
		console.log(`> Compiling ${bold(name)} in ${bold(dirPath)}`)

		const result = await compileSol(filePath, "auto", {
			basePath: dirPath,
			includePath: [NODE_MODULES_DIR],
		})

		const abi: unknown = result.data["contracts"][filePath][name]["abi"]
		const bin: string =
			result.data["contracts"][filePath][name]["evm"]["bytecode"][
				"object"
			]

		await fs.writeFile(
			path.join(artifactsDirPath, `${name}.ts`),
			[
				`export type ${name}_ABI = typeof ${name}_ABI;`,
				`export const ${name}_ABI = ${JSON.stringify(abi)} as const;`,
				// `export const ${name}_BIN = "${bin}";`,
			].join("\n"),
		)

		await fs.writeFile(
			path.join(artifactsDirPath, `${name}.abi.json`),
			JSON.stringify(abi),
		)

		console.log(green(`>> ${bold(name)} compiled successfully!`))
	}
}
