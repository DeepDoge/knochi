import type { BrandedType } from "@/utils/branded-type"
import { ethers } from "ethers"
import { Address } from "./address"

const idByteLength = 20 + 32 // contract address + post index

export type PostId = BrandedType<string, "PostId">
export function PostId(postId: string): PostId {
	return postIdFromHex(postIdToHex(postId as PostId))
}
export function postIdFromHex(postIdHex: string): PostId {
	const bytes = ethers.toBeArray(postIdHex)
	if (bytes.byteLength !== idByteLength) throw new Error(`Size of provided postId ${bytes.length} doesn't match with expected size ${idByteLength}`)
	return ethers.encodeBase64(bytes) as PostId
}

export function postIdToHex(postId: PostId): string {
	return ethers.hexlify(ethers.decodeBase64(postId))
}

export function extractContractAddressFromPostId(postId: PostId) {
	return Address(ethers.hexlify(ethers.toBeArray(postIdToHex(postId)).subarray(0, 20)))
}
