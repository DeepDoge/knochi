import { Address } from "@/utils/address"
import type { BrandedType } from "@/utils/branded-type"
import { ethers } from "ethers"

const minimumPostIdByteLength = 20 + 1 // contract address + contract post index
const maximumPostIdByteLength = 20 + 32

export type PostId = BrandedType<string, "PostId">
export function PostId(postId: string): PostId {
	return PostId.fromHex(PostId.toHex(postId as PostId))
}
export namespace PostId {
	export function fromHex(postIdHex: string): PostId {
		const bytes = ethers.toBeArray(postIdHex)
		if (bytes.byteLength < minimumPostIdByteLength || bytes.byteLength > maximumPostIdByteLength)
			throw new Error(
				`Size of provided postId ${bytes.length} doesn't match with expected size to be between(inclusive) ${minimumPostIdByteLength} and ${maximumPostIdByteLength}`
			)
		const base64 = ethers.encodeBase64(bytes)
		return base64 as PostId
	}

	export function toHex(postId: PostId): string {
		return ethers.hexlify(ethers.decodeBase64(postId))
	}

	export function extractContractAddressFromPostId(postId: PostId) {
		return Address(ethers.hexlify(ethers.toBeArray(toHex(postId)).subarray(0, 20)))
	}
}
