import { ethers } from "ethers"

export type Address = string & { _: "Address" }
export function Address(value: string): Address {
	const bytes = ethers.utils.arrayify(value)
	if (bytes.byteLength !== 20) throw new Error(`Address length of ${value} doesn't match.`)
	return ethers.utils.hexlify(bytes) as Address
}
