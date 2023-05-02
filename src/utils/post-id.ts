import { ethers } from "ethers"

export type PostId = string & { _: "PostId" }
export function PostId(postId: string): PostId {
	return postId as PostId
}
export function postIdFromHex(postIdHex: string): PostId {
	return ethers.utils.base58.encode(postIdHex) as PostId
}

export function postIdToHex(postId: PostId): string {
	return ethers.utils.hexlify(ethers.utils.base58.decode(postId))
}
