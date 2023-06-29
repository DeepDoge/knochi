import type { networkConfigs } from "@/api/network-config"
import type { Address } from "./address"
import type { PostId } from "./post-id"

export type PostData = {
	id: PostId
	parentId: PostId | null
	index: bigint
	author: Address
	contents: { type: string; value: Uint8Array }[]
	createdAt: Date
	chainKey: networkConfigs.ChainKey
	replyCount: bigint
	contractAddress: Address
	contractData: {
		tip: Promise<{
			to: Address
			value: bigint
		}> | null
	}
}
