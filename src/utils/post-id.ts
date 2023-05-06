import { Address } from "@/utils/address"
import type { BrandedType } from "@/utils/branded-type"
import { ethers } from "ethers"

export type PostId = BrandedType<string, "PostId">
export namespace PostId {
	const minimumByteLength = 20 + 1 // contract address + contract post index
	const maximumByteLength = 20 + 32

	export function from(postId: string): PostId {
		return fromHex(toHex(postId as PostId))
	}

	export function fromHex(postIdHex: string): PostId {
		const bytes = ethers.toBeArray(postIdHex)
		if (bytes.byteLength < minimumByteLength || bytes.byteLength > maximumByteLength)
			throw new Error(
				`Size of provided postId ${bytes.length} doesn't match with expected size to be between(inclusive) ${minimumByteLength} and ${maximumByteLength}`
			)
		const base64 = ethers.encodeBase64(bytes)
		return base64 as PostId
	}

	export function toHex(postId: PostId): string {
		return ethers.hexlify(ethers.decodeBase64(postId))
	}

	export function extractContractAddressFromPostId(postId: PostId) {
		return Address.from(ethers.hexlify(ethers.toBeArray(toHex(postId)).subarray(0, 20)))
	}
}
