import { Networks } from "@/networks"
import { ethers } from "ethers"
import { gql } from "urql"
import { Address } from "./address"
import { PostId } from "./post-id"

export type Post = {
	id: PostId
	parentId: PostId | null
	index: bigint
	author: Address
	contents: { type: string; value: Uint8Array }[]
	createdAt: Date
	chainKey: Networks.ChainKey
	replyCount: bigint
	contractAddress: Address
	contractData: {
		tip: Promise<{
			to: Address
			value: bigint
		}> | null
	}
}

export namespace Post {
	const postsCache = new Map<PostId, Post | null>()

	export async function getPosts(postIds: PostId[]): Promise<Post[]> {
		const query = (postIds: PostId[]) => gql`
	{
		posts(where: { or: [ ${postIds.map((postId) => `{ id: "${PostId.toHex(postId)}" }`).join("\n")} ] }) {
			id
			parentId
			index
			contract

			author
			contents {
				type
				value
			}
			blockTimestamp
		}
	}`

		const toQuery = new Map<Networks.GraphClient, Set<PostId>>()
		const posts: Record<PostId, Post> = {}
		for (const postId of postIds) {
			if (postsCache.has(postId)) {
				const cache = postsCache.get(postId)
				if (cache) posts[cache.id] = cache
				continue
			}
			const { chainId } = PostId.toDescription(postId)
			const chainKey = Networks.chainIdToKeyMap.get(chainId)
			if (!chainKey) throw new Error(`Chain key for chain id ${chainId} can't be found.`)

			const client = Networks.chainKeyToGraphClient[chainKey]
			if (!client) throw new Error(`Client for chain key "${chainKey}" can't be found.`)

			const postIds = toQuery.get(client) ?? toQuery.set(client, new Set()).get(client)!
			postIds.add(postId)
		}

		for (const [client, postIds] of toQuery.entries()) {
			const responsePosts = ((await client.urqlClient.query<{ posts: any[] }>(query(Array.from(postIds)), {})).data?.posts ?? [])
				.map((responsePost): Post | null => {
					try {
						return {
							id: PostId.fromHex(responsePost.id),
							parentId: responsePost.parentId === "0x" ? null : PostId.fromHex(responsePost.parentId),
							index: ethers.toBigInt(responsePost.index),
							author: Address.from(responsePost.author),
							contents: responsePost.contents.map((content: any): Post["contents"][number] => ({
								type: ethers.toUtf8String(ethers.toBeArray(content.type)),
								value: ethers.toBeArray(content.value),
							})),
							createdAt: new Date(parseInt(responsePost.blockTimestamp) * 1000),
							chainKey: client.key,
							contractAddress: responsePost.contract,
							replyCount: 0n,
							contractData: {
								tip: null,
							},
						}
					} catch (error) {
						console.warn("Invalid post data", responsePost, error)
						return null
					}
				})
				.filter(Boolean)

			const responsePostIds = responsePosts.map((post) => post.id)
			const postReplyCounts = await getReplyCounts(responsePostIds)
			for (const post of responsePosts) post.replyCount = postReplyCounts[post.id] ?? 0n

			// TODO: Implement this.
			for (const post of responsePosts) {
				const contractsOfChain = Networks.contracts[post.chainKey]
				for (const name of Object.keys(contractsOfChain) as (keyof typeof contractsOfChain)[]) {
					if (name === "EternisTipPostDB") {
						// To implement this, I need a read-only JSON-RPC wallet to call the contract on any chain.
						// At the moment, I only have a read-write browser wallet.
					}
				}
			}

			for (const post of responsePosts) {
				postsCache.set(post.id, post)
				if (post) posts[post.id] = post
			}
		}

		return postIds
			.map((postId) => {
				const post = posts[postId]
				if (!post) postsCache.set(postId, null)
				return post
			})
			.filter(Boolean)
	}

	export async function getReplyCounts(postIds: PostId[]): Promise<Record<PostId, bigint>> {
		const query = gql`
		{
			postReplyCounters(where: { or: [
				${postIds.map((postId) => `{ id: "${PostId.toHex(postId)}" }`).join("\n")}
				] 
			}) {
				id
				count
			}
		}
	`

		const replyCountsByChain = (await Promise.all(
			Networks.graphClients.map(async ({ urqlClient: client }) => (await client.query(query, {})).data?.postReplyCounters ?? [])
		)) as {
			id: string
			count: string
		}[][]

		const replyCounts: Record<PostId, bigint> = {}
		for (const replyCountsOfChain of replyCountsByChain) {
			for (const replyCount of replyCountsOfChain) {
				const id = PostId.fromHex(replyCount.id)
				const current = replyCounts[id]
				replyCounts[id] = current ? current + ethers.toBigInt(replyCount.count) : ethers.toBigInt(replyCount.count)
			}
		}

		return replyCounts
	}
}
