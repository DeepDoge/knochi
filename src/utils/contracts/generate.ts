import fs from "fs"
import { compileAndSave } from "@ethereum-waffle/compiler"
import path from "path"

let [contractsDirPath] = process.argv.slice(2)
contractsDirPath ??= "./src/contracts"
const contractFilenames = fs.readdirSync(contractsDirPath).filter((filename) => filename.endsWith(".sol"))

const artifactsDirPath = path.join(contractsDirPath, "artifacts")

console.log("Generating abi files...")
await compileAndSave({
	sourceDirectory: contractsDirPath,
	outputDirectory: artifactsDirPath,
})
console.log("Generated abi files ")
console.log()

for (const filename of contractFilenames) {
	const contractFilePath = path.resolve(path.join(contractsDirPath, filename))
	const name = path.basename(contractFilePath, ".sol")
	const tsFilename = `${name}.ts`
	console.log(`Generating ${tsFilename}...`)

	const jsonFilePath = path.join(artifactsDirPath, `${name}.json`)
	const json = fs.readFileSync(jsonFilePath).toString()
	const jsonObj = JSON.parse(json)
	if (!(jsonObj && typeof jsonObj === "object" && "abi" in jsonObj && Array.isArray(jsonObj.abi)))
		throw new Error("Json file is doesn't contain abi.")
	const abi = jsonObj.abi
	const type = [
		`import type { TypifyContract } from "@/utils/contracts/types"`,
		`import type { Provider } from "@ethersproject/providers"`,
		`import { Contract, Signer } from "ethers"`,
		`export type ${name}_Contract = TypifyContract<typeof abi> & {}`,
		`export const connect_${name} = (address: string, signer: Signer | Provider) => new Contract(address, abi, signer) as ${name}_Contract`,
		`const abi = ${JSON.stringify(abi, null, "\t")} as const`,
	].join("\n")
	fs.writeFileSync(path.join(artifactsDirPath, tsFilename), type)

	console.log(`Generated ${filename}`)
}
console.log()
console.log("Done")
