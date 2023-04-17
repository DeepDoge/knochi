import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"
import type { HardhatUserConfig } from "hardhat/config"

const config: HardhatUserConfig = {
	solidity: "0.8.18",
	networks: {},
	typechain: {
		outDir: "../src/typechain",
		target: "ethers-v5",
		alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
		dontOverrideCompile: false, // defaults to false
	},
}

export default config
