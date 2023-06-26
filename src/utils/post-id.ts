import type { BrandedType } from "@/utils/branded-type"
import { ethers } from "ethers"

export type PostId = BrandedType<string, "PostId">
export namespace PostId {
	export function from(postId: string): PostId {
		return fromHex(toHex(postId as PostId))
	}

	export function fromHex(postIdHex: string): PostId {
		const bytes = ethers.toBeArray(postIdHex)
		const base64 = ethers.encodeBase64(bytes)
		return base64 as PostId
	}

	export function toHex(postId: PostId): string {
		return ethers.hexlify(ethers.decodeBase64(postId))
	}

	export function toUint8Array(postId: PostId): Uint8Array {
		return ethers.decodeBase64(postId)
	}

	export type Description = {
		chainId: bigint
		postIndex: bigint
	}

	export function toDescription(postId: PostId): Description
	{
		const postIdBytes = toUint8Array(postId)
		const chainIdSize = postIdBytes[0]!
		const chainId =  ethers.toBigInt(postIdBytes.slice(1, chainIdSize + 1))
		const postIndex = ethers.toBigInt(postIdBytes.slice(1 + chainIdSize))

		return {
			chainId,
			postIndex
		}
	}
}
