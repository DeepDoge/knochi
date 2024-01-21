import { exec } from "node:child_process"
import fs from "node:fs/promises"
import networks from "./networks.json"

const networkNames = Object.keys(networks) as Array<keyof typeof networks>
type NetworkName = (typeof networkNames)[number]

const YAML_FILE = "./graph/subgraph.yaml"
const NETWORK_FILE = "./graph/networks.json"
const OUTPUT_DIR = "./graph/build"

async function updateYamlFile(networkName: NetworkName) {
	let yaml = await fs.readFile(YAML_FILE, { encoding: "utf8" })
	const start = yaml.indexOf("file: ./assembly/mapping-")
	const end = yaml.indexOf("\n", start)
	yaml = `${yaml.slice(0, start)}file: ./assembly/mapping-${networkName}.ts${yaml.slice(end)}`
	await fs.writeFile(YAML_FILE, yaml)
}

async function execPromise(command: string) {
	return new Promise<void>((resolve, reject) => {
		return exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error.message)
			} else {
				resolve()
			}
			if (stdout) console.log(stdout)
		})
	})
}

async function deploy(networkName: NetworkName, version: string) {
	await updateYamlFile(networkName)
	await execPromise(
		[
			`npx graph deploy`,
			`--studio`,
			`--network-file=${JSON.stringify(NETWORK_FILE)}`,
			`--network=${networkName}`,
			`--version-label=${version}`,
			`--output-dir=${OUTPUT_DIR}`,
			`dforum-${networkName} ${YAML_FILE}`,
		].join(" "),
	)
}

const version = `dev-${Date.now()}`
for (const networkName of networkNames) {
	await deploy(networkName, version)
}
await fs.writeFile("./graph/version.json", JSON.stringify(version), {
	encoding: "utf8",
})
