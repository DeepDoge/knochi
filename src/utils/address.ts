import { ethers } from "ethers"
import type { BrandedType } from "@/utils/branded-type"

export type Address = BrandedType<string, "Address">
export function Address(value: string): Address {
	const bytes = ethers.toBeArray(value)
	if (bytes.byteLength !== 20) throw new Error(`Address length of ${value} doesn't match.`)
	return ethers.hexlify(bytes) as Address
}
