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
}
