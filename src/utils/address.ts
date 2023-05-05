import type { BrandedType } from "@/utils/branded-type"
import { ethers } from "ethers"

export type Address = BrandedType<string, "Address">
export function Address(value: string): Address {
	const bytes = ethers.toBeArray(value)
	if (bytes.byteLength !== 20) throw new Error(`Address length of ${value} doesn't match. Got length ${bytes.length}, expected ${20}`)
	return ethers.hexlify(bytes) as Address
}
