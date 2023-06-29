import { networkConfigs } from "@/api/network-config"
import { Address } from "@/utils/address"
import { BigMath } from "@/utils/bigmath"
import type { PostData } from "@/utils/post"
import { PostId } from "@/utils/post-id"
import { ethers } from "ethers"
import { $ } from "master-ts/library/$"
import type { SignalReadable } from "master-ts/library/signal"
import { cacheExchange, createClient, fetchExchange, gql } from "urql"
import { wallet } from "../wallet"

// This is kinda ugly but its fine, not gonna look at this so often
// Can make it cleaner later if i need to
// Just not a priority atm

/* 
	TODO: api folder should be removed and these stuff should be inside utils
	network-configs should be in src
	there should be no such thing as theGraphApi, this should be inside post namespace
	and we should have the timeline namespace seperatylu
	clients here should be inisde network-configs
	network-configs should be renamed to network etc. idk
*/

export namespace theGraphApi {
	const clients = Object.entries(networkConfigs.graphs).map(([key, value]) => ({
		key: key as networkConfigs.ChainKey,
		urqlClient: createClient({
			url: value.api.href,
			exchanges: [cacheExchange, fetchExchange],
		}),
	}))
	type GraphClient = (typeof clients)[number]
	const chainKeyToClient: Record<string, GraphClient> = {}
	for (const client of clients) chainKeyToClient[client.key] = client

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
			clients.map(async ({ urqlClient: client }) => (await client.query(query, {})).data?.postReplyCounters ?? [])
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

	const postsCache = new Map<PostId, PostData | null>()
	export async function getPosts(postIds: PostId[]): Promise<PostData[]> {
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

		const toQuery = new Map<GraphClient, Set<PostId>>()
		const posts: Record<PostId, PostData> = {}
		for (const postId of postIds) {
			if (postsCache.has(postId)) {
				const cache = postsCache.get(postId)
				if (cache) posts[cache.id] = cache
				continue
			}
			const { chainId } = PostId.toDescription(postId)
			const chainKey = networkConfigs.chainIdToKeyMap.get(chainId)
			if (!chainKey) throw new Error(`Chain key for chain id ${chainId} can't be found.`)

			const client = chainKeyToClient[chainKey]
			if (!client) throw new Error(`Client for chain key "${chainKey}" can't be found.`)

			const postIds = toQuery.get(client) ?? toQuery.set(client, new Set()).get(client)!
			postIds.add(postId)
		}

		for (const [client, postIds] of toQuery.entries()) {
			const responsePosts = ((await client.urqlClient.query<{ posts: any[] }>(query(Array.from(postIds)), {})).data?.posts ?? [])
				.map((responsePost): PostData | null => {
					try {
						return {
							id: PostId.fromHex(responsePost.id),
							parentId: responsePost.parentId === "0x" ? null : PostId.fromHex(responsePost.parentId),
							index: ethers.toBigInt(responsePost.index),
							author: Address.from(responsePost.author),
							contents: responsePost.contents.map((content: any): PostData["contents"][number] => ({
								type: ethers.toUtf8String(ethers.toBeArray(content.type)),
								value: ethers.toBeArray(content.value),
							})),
							createdAt: new Date(parseInt(responsePost.blockTimestamp) * 1000),
							chainKey: client.key,
							contractAddress: responsePost.contract,
							replyCount: 0n,
							tip: null,
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

			// TODO: finish this
			for (const post of responsePosts) {
				const contractsOfChain = networkConfigs.contracts[post.chainKey]
				for (const name of Object.keys(contractsOfChain) as (keyof typeof contractsOfChain)[]) {
					const address = contractsOfChain[name]
					if (name === "EternisTipPostDB") {
						wallet.browserWallet.ref?.contracts[name]
						// post.tip =
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

	export type Timeline = {
		loadBottom(): Promise<void>
		posts: SignalReadable<PostData[]>
		loading: SignalReadable<boolean>
		newPostCountAtTop: SignalReadable<number>
	}

	export type QueryOptions<TParentID extends PostId> = {
		author?: Address
		parentId?: TParentID
		replies?: [TParentID] extends [never] ? "include" | "only" : never
		mention?: Address
		search?: string[]
		top?: "minute" | "hour" | "day" | "week" | "month" | "year" | "all-time"
	}

	export function createTimeline<TParentID extends PostId = never>(options: QueryOptions<TParentID>, rule: "and" | "or" = "and"): Timeline {
		const query = (count: number, beforeIndex?: bigint) => gql`
	{
		posts(
			first: ${count.toString()}
			orderBy: index
			orderDirection: desc 
			where: { and: [
				{ or: [{ contents_: { value_not: "" } }, { contents_: { type_not: "" } }] } 
				{ ${rule}: [
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
					${
						options.search
							? `{ or: [${options.search
									.map((term) => `{ contents_: { value_contains: "${ethers.hexlify(ethers.toUtf8Bytes(term)).substring(2)}" } }`)
									.join("\n")}] }`
							: ""
					}
					${beforeIndex ? (beforeIndex >= 0n ? `{ index_lt: ${beforeIndex.toString()} }` : `{ index_gt: ${BigMath.abs(beforeIndex).toString()} }`) : ""} 
				]}
			] }
		) {
			id
			index
			contract
		}
	}`

		const posts = $.writable<PostData[]>([])
		const postQueuesOfChains = clients.map(() => [] as PostData[])
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
							((await client.urqlClient.query(query(count, lastIndex[index]), {}).toPromise()).data?.posts ?? []) as {
								id: string
								index: string
								contract: string
							}[]
						)
							.map((post) => {
								try {
									return {
										id: PostId.fromHex(post.id),
										index: ethers.toBigInt(post.index),
										contract: Address.from(post.contract),
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
