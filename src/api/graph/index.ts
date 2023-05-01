import { Address } from "@/utils/address"
import { BigNumber, ethers } from "ethers"
import { $ } from "master-ts/library/$"
import type { SignalReadable } from "master-ts/library/signal"
import { cacheExchange, createClient, fetchExchange, gql } from "urql"
import { networks } from "../networks"

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

export type PostData = {
	id: PostId
	parentId: PostId | null
	index: BigNumber
	tip: {
		to: Address
		value: BigNumber
	} | null
	author: Address
	contents: { type: string; value: Uint8Array }[]
	createdAt: Date
	chainKey: networks.ChainKey
}

const clients = Object.entries(networks.graphApis).map(([key, value]) => ({
	key: key as networks.ChainKey,
	urqlClient: createClient({
		url: value.url.href,
		exchanges: [cacheExchange, fetchExchange],
	}),
}))
type GraphClient = (typeof clients)[number]
const contractAddressToClientMap: Record<Address, GraphClient> = {}
for (const client of clients) {
	for (const contract of Object.values(networks.subgraphs[client.key])) {
		contractAddressToClientMap[Address(contract.address.toLowerCase())] = client
	}
}

export async function getReplyCounts(postIds: PostId[]): Promise<Record<PostId, BigNumber>> {
	const query = gql`
		{
			postReplyCounters(where: { or: [
				${postIds.map((postId) => `{ id: "${postIdToHex(postId)}" }`).join("\n")}
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

	const replyCounts: Record<PostId, BigNumber> = {}
	for (const replyCountsOfChain of replyCountsByChain) {
		for (const replyCount of replyCountsOfChain) {
			const id = PostId(replyCount.id)
			const current = replyCounts[id]
			replyCounts[id] = current ? current.add(replyCount.count) : BigNumber.from(0)
		}
	}

	return replyCounts
}

const postsCache: Record<PostId, PostData> = {}
export async function getPosts(postIds: PostId[]): Promise<PostData[]> {
	const query = (postIds: PostId[]) => gql`
	{
		posts(where: { or: [ ${postIds.map((postId) => `{ id: "${postIdToHex(postId)}" }`).join("\n")} ] }) {
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
	const posts: PostData[] = []
	for (const postId of postIds) {
		const cache = postsCache[postId]
		if (cache) {
			posts.push(cache)
			continue
		}

		const contractAddress = Address(ethers.utils.hexlify(ethers.utils.arrayify(postIdToHex(postId)).subarray(0, 20)))
		const client = contractAddressToClientMap[contractAddress]
		if (!client) throw new Error(`Client for contract "${contractAddress}" can't be found.`)

		const postIds = toQuery.get(client) ?? toQuery.set(client, new Set()).get(client)!
		postIds.add(postId)
	}

	for (const [client, postIds] of toQuery.entries()) {
		const responsePosts = (await (
			await client.urqlClient.query(query(Array.from(postIds)), {})
		).data.posts.map((responsePost: any) => ({
			id: postIdFromHex(responsePost.id),
			parentId: responsePost.parentId === "0x" ? null : postIdFromHex(responsePost.parentId),
			index: BigNumber.from(responsePost.index),
			author: Address(responsePost.author),
			contents: responsePost.contents.map((content: any): PostData["contents"][number] => ({
				type: ethers.utils.toUtf8String(ethers.utils.arrayify(content.type)),
				value: ethers.utils.arrayify(content.value),
			})),
			createdAt: new Date(parseInt(responsePost.blockTimestamp) * 1000),
			chainKey: client.key,
			tip: responsePost.tip
				? {
						to: Address(responsePost.tip.to),
						value: BigNumber.from(responsePost.tip.value),
				  }
				: null,
		}))) as PostData[]

		for (const post of responsePosts) {
			postsCache[post.id] = post
			if (post) posts.push(post)
		}
	}

	return posts
}

export type Timeline = {
	loadBottom(): Promise<void>
	posts: SignalReadable<PostData[]>
	loading: SignalReadable<boolean>
}

export function getTimeline(options: {
	author?: Address
	parentId?: PostId
	replies?: "include" | "only"
	mention?: Address
	search?: string
	top?: "minute" | "hour" | "day" | "week" | "month" | "year" | "all-time"
}): Timeline {
	const listQuery = (count: number, beforeIndex: BigNumber) => gql`
	{
		posts(
			first: ${count.toString()}
			orderBy: index
			orderDirection: desc 
			where: { and: [
				{ or: [{ contents_: { value_not: "" } }, { contents_: { type_not: "" } }] } 
				${options.author ? `{ author: "${options.author}" }` : ""}
				${options.parentId ? `{ parentId: "${postIdToHex(options.parentId)}" }` : ""}
				${
					options.parentId
						? ""
						: options.replies === "include"
						? ""
						: options.replies === "only"
						? `{ parentId_not: "0x" }`
						: `{ parentId: "0x" }`
				}
				${
					options.mention
						? `{ contents_: { type: "${ethers.utils.hexlify(ethers.utils.toUtf8Bytes("mention"))}",  value: "${
								options.mention
						  }" } }`
						: ""
				}
				${
					options.search
						? `{ contents_: { value_contains: "${ethers.utils
								.hexlify(ethers.utils.toUtf8Bytes(options.search))
								.substring(2)}" } }`
						: ""
				}
				{ index_lt: ${beforeIndex.toString()} }
			] }
		) {
			id
			index
		}
	}`

	const posts = $.writable<PostData[]>([])
	const postQueuesOfChains = clients.map(() => [] as PostData[])
	const isChainFinished = new Array(clients.length).fill(false)
	const lastIndex = new Array(clients.length).fill(Number.MAX_SAFE_INTEGER)

	let loading = $.writable(false)
	async function loadBottom(count = 128) {
		if (loading.ref) return
		loading.ref = true
		try {
			await Promise.all(
				clients.map(async ({ urqlClient: client }, index) => {
					const postQueue = postQueuesOfChains[index]!
					if (postQueue.length >= count) return
					if (isChainFinished[index]) return

					const listResponse = await client.query(listQuery(count, lastIndex[index]!), {}).toPromise()
					if (listResponse.data.posts.length === 0) return

					const listOfNewPosts = listResponse.data.posts.map((post: any) => ({
						id: postIdFromHex(post.id),
						index: BigNumber.from(post.index),
					})) as { id: PostId; index: BigNumber }[]

					if (listOfNewPosts.length < count) isChainFinished[index] = true
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
		}
	}

	return {
		posts,
		loading,
		loadBottom,
	}
}

// TODO: Get top posts
