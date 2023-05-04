import { ethers } from "ethers"
import type { _ } from "@/utils/_"

export type Address = string & { [_]: "Address" }
export function Address(value: string): Address {
	const bytes = ethers.toBeArray(value)
	if (bytes.byteLength !== 20) throw new Error(`Address length of ${value} doesn't match.`)
	return ethers.hexlify(bytes) as Address
}
