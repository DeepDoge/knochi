import { Signer } from "ethers"
import fs from "fs"
import { ethers } from "hardhat"

async function deployContract(name: string, signer: Signer) {
	const deploys: Record<string, string> = JSON.parse(fs.readFileSync("./deployed.json", { encoding: "utf-8" }))
	const key = `${await signer.getChainId()}-${name}`
	if (deploys[key]) return

	const Contract = await ethers.getContractFactory(name, signer)
	const contract = await Contract.deploy()
	await contract.deployed()
	console.log(`${name} deployed to ${contract.address}`)

	deploys[key] = contract.address
	fs.writeFileSync("./deployed.json", JSON.stringify(deploys), { encoding: "utf-8" })
}

async function deploy() {
	deployContract("PostDB")
}

deploy().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
