import fs from "fs"
import path from "path"

const artifactsDirPath = "./src/contracts/artifacts"
const artifactsDir = fs.readdirSync(artifactsDirPath)
const abiFilenames = artifactsDir.filter((filename) => filename.endsWith(".json") && !filename.endsWith("_metadata.json"))

for (const filename of abiFilenames) {
	const filePath = path.resolve(path.join(artifactsDirPath, filename))
	const name = path.basename(filePath, ".json")
	const json = fs.readFileSync(filePath).toString()
	const jsonObj = JSON.parse(json)
	if (!(jsonObj && typeof jsonObj === "object" && "abi" in jsonObj && Array.isArray(jsonObj.abi)))
		throw new Error("Json file is doesn't contain abi.")
	const abi = jsonObj.abi
	const type = [
		`import type { TypifyContract } from "@/utils/typify-contracts/types"`,
		`import type { Provider } from "@ethersproject/providers"`,
		`import { Contract, Signer } from "ethers"`,
		`export type ${name}_Contract = TypifyContract<typeof abi> & {}`,
		`export const connect_${name} = (address: string, signer: Signer | Provider) => new Contract(address, abi, signer) as ${name}_Contract`,
		`const abi = ${JSON.stringify(abi, null, "\t")} as const`,
	].join("\n")
	fs.writeFileSync(path.join(path.dirname(filePath), `${name}.ts`), type)
}
