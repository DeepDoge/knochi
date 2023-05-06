import { NetworkConfigs } from "@/api/network-config"
import { Address } from "@/utils/address"
import { BigMath } from "@/utils/bigmath"
import { PostId } from "@/utils/post-id"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import type { SignalReadable } from "master-ts/library/signal"
import { cacheExchange, createClient, fetchExchange, gql } from "urql"

export namespace TheGraphApi {
	export type Post = {
		id: PostId
		parentId: PostId | null
		index: bigint
		tip: {
			to: Address
			value: bigint
		} | null
		author: Address
		contents: { type: string; value: Uint8Array }[]
		createdAt: Date
		chainKey: NetworkConfigs.ChainKey
	}

	const clients = Object.entries(NetworkConfigs.graphs).map(([key, value]) => ({
		key: key as NetworkConfigs.ChainKey,
		urqlClient: createClient({
			url: value.api.href,
			exchanges: [cacheExchange, fetchExchange],
		}),
	}))
	type GraphClient = (typeof clients)[number]
	const contractAddressToClientMap: Record<Address, GraphClient> = {}
	for (const client of clients) {
		for (const contract of Object.values(NetworkConfigs.contracts[client.key])) {
			contractAddressToClientMap[Address.from(contract)] = client
		}
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
			clients.map(async ({ urqlClient: client }) => (await client.query(query, {})).data.postReplyCounters)
		)) as {
			id: string
			count: string
		}[][]

		const replyCounts: Record<PostId, bigint> = {}
		for (const replyCountsOfChain of replyCountsByChain) {
			for (const replyCount of replyCountsOfChain) {
				const id = PostId.fromHex(replyCount.id)
				const current = replyCounts[id]
				replyCounts[id] = current ? current + ethers.toBigInt(replyCount.count) : 0n
			}
		}

		return replyCounts
	}

	const postsCache = new Map<PostId, Post | null>()
	export async function getPosts(postIds: PostId[]): Promise<Post[]> {
		const query = (postIds: PostId[]) => gql`
	{
		posts(where: { or: [ ${postIds.map((postId) => `{ id: "${PostId.toHex(postId)}" }`).join("\n")} ] }) {
			id
			parentId
			index

			author
			contents {
				type
				value
			}
			tip {
				to
				value
			}
			blockTimestamp
		}
	}`

		const toQuery = new Map<GraphClient, Set<PostId>>()
		const posts: Record<PostId, Post> = {}
		for (const postId of postIds) {
			if (postsCache.has(postId)) {
				const cache = postsCache.get(postId)
				if (cache) posts[cache.id] = cache
				continue
			}

			const contractAddress = PostId.extractContractAddressFromPostId(postId)
			const client = contractAddressToClientMap[contractAddress]
			if (!client) throw new Error(`Client for contract "${contractAddress}" can't be found.`)

			const postIds = toQuery.get(client) ?? toQuery.set(client, new Set()).get(client)!
			postIds.add(postId)
		}

		for (const [client, postIds] of toQuery.entries()) {
			const responsePosts = (
				await (
					await client.urqlClient.query(query(Array.from(postIds)), {})
				).data.posts.map((responsePost: any) => {
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
							tip: responsePost.tip
								? {
										to: Address.from(responsePost.tip.to),
										value: ethers.toBigInt(responsePost.tip.value),
								  }
								: null,
						}
					} catch (error) {
						console.warn("Invalid post data", responsePost, error)
						return null
					}
				})
			).filter(Boolean) as Post[]

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

	export type Timeline = {
		loadBottom(): Promise<void>
		posts: SignalReadable<Post[]>
		loading: SignalReadable<boolean>
		newPostCountAtTop: SignalReadable<number>
	}

	export type QueryOptions<TParentID extends PostId> = {
		author?: Address
		parentId?: TParentID
		replies?: [TParentID] extends [never] ? "include" | "only" : never
		mention?: Address
		search?: string
		top?: "minute" | "hour" | "day" | "week" | "month" | "year" | "all-time"
	}

	export function createTimeline<TParentID extends PostId = never>(options: QueryOptions<TParentID>): Timeline {
		const query = (count: number, beforeIndex?: bigint) => gql`
	{
		posts(
			first: ${count.toString()}
			orderBy: index
			orderDirection: desc 
			where: { and: [
				{ or: [{ contents_: { value_not: "" } }, { contents_: { type_not: "" } }] } 
				${options.author ? `{ author: "${options.author}" }` : ""}
				${
					options.parentId
						? `{ parentId: "${PostId.toHex(options.parentId)}" }`
						: options.replies === "include"
						? ""
						: options.replies === "only"
						? `{ parentId_not: "0x" }`
						: `{ parentId: "0x" }`
				}
				${options.mention ? `{ contents_: { type: "${ethers.hexlify(ethers.toUtf8Bytes("mention"))}",  value: "${options.mention}" } }` : ""}
				${options.search ? `{ contents_: { value_contains: "${ethers.hexlify(ethers.toUtf8Bytes(options.search)).substring(2)}" } }` : ""}
				${beforeIndex ? (beforeIndex >= 0n ? `{ index_lt: ${beforeIndex.toString()} }` : `{ index_gt: ${BigMath.abs(beforeIndex).toString()} }`) : ""} 
			] }
		) {
			id
			index
		}
	}`

		const posts = $.writable<Post[]>([])
		const postQueuesOfChains = clients.map(() => [] as Post[])
		const isChainFinished = new Array(clients.length).fill(false)
		const lastIndex = new Array<bigint>(clients.length)

		const loadedOnce = $.writable(false)

		let loading = $.writable(false)
		async function loadBottom(count = 128) {
			if (loading.ref) return
			loading.ref = true
			try {
				await Promise.all(
					clients.map(async (client, index) => {
						const postQueue = postQueuesOfChains[index]!
						if (postQueue.length >= count) return
						if (isChainFinished[index]) return
						const listOfNewPosts = (
							(await client.urqlClient.query(query(count, lastIndex[index]), {}).toPromise()).data.posts as { id: string; index: string }[]
						)
							.map((post) => {
								try {
									return {
										id: PostId.fromHex(post.id),
										index: ethers.toBigInt(post.index),
									}
								} catch (error) {
									console.warn("Invalid post referance", post, error)
									return null
								}
							})
							.filter(Boolean)

						if (listOfNewPosts.length < count) {
							isChainFinished[index] = true
							if (listOfNewPosts.length === 0) return
						}
						lastIndex[index] = listOfNewPosts[listOfNewPosts.length - 1]!.index

						postQueue.push(...(await getPosts(listOfNewPosts.map((post) => post.id))))
					})
				)

				const postsLengthCache = posts.ref.length
				for (let i = 0; i < count; i++) {
					let newestChainIndex = null as number | null
					for (let index = 0; index < postQueuesOfChains.length; index++) {
						const peek = postQueuesOfChains[index]![0]
						if (!peek) continue

						if (newestChainIndex === null) {
							newestChainIndex = index
							continue
						}
						const newestPost = postQueuesOfChains[newestChainIndex]![0]!
						if (newestPost.createdAt < peek.createdAt) newestChainIndex = index
					}
					if (newestChainIndex === null) break
					posts.ref.push(postQueuesOfChains[newestChainIndex]!.shift()!)
				}

				if (posts.ref.length !== postsLengthCache) posts.signal()
			} catch (error) {
				console.error(error)
			} finally {
				loading.ref = false
				loadedOnce.ref = true
			}
		}

		const newPostsAtTop = $.writable(0)

		// TODO: do this.
		/* {
		const unsubscribe = loadedOnce.subscribe(async (loadedOnce) => {
			if (!loadedOnce) return
			unsubscribe()

			let index = 0
			for (const client of clients) {
				client.urqlClient.subscription(query(10, posts.ref[0]?.index), {}).subscribe((value) => {
					newPostsAtTop.ref += value.data.posts.length
				})
				index++
			}
		}).unsubscribe
	} */

		return {
			posts,
			loading,
			loadBottom,
			newPostCountAtTop: newPostsAtTop,
		}
	}
}

// TODO: Get top posts
