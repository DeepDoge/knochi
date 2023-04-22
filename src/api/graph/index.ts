import { Address } from "@/utils/address"
import { BigNumber, ethers } from "ethers"
import { $ } from "master-ts/library/$"
import type { SignalReadable } from "master-ts/library/signal/readable"
import { cacheExchange, createClient, fetchExchange, gql } from "urql"
import { networks } from "../networks"

export type PostId = string & { _: "PostId" }
export function PostId(postId: string): PostId {
	return postId as PostId
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
	replyCount: BigNumber
	chainKey: networks.ChainKey
}

const clients = Object.entries(networks.graphApis).map(([key, value]) => ({
	key: key as networks.ChainKey,
	urqlClient: createClient({
		url: value.url.href,
		exchanges: [cacheExchange, fetchExchange],
	}),
}))
const contractAddressToClientMap: Record<Address, (typeof clients)[number]> = {}
for (const client of clients) {
	for (const contract of Object.values(networks.subgraphs[client.key])) {
		contractAddressToClientMap[Address(contract.address.toLowerCase())] = client
	}
}

export async function getReplyCounts(postIds: PostId[]): Promise<Record<PostId, BigNumber>> {
	const query = gql`
		{
			postReplyCounters(where: { or: [
				${postIds.map((postId) => `{ id: "${postId}" }`).join("\n")}
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

export async function getPost(postId: PostId): Promise<PostData | null> {
	const query = gql`
	{
		post(id: "${postId}") {
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

	const contractAddress = Address(ethers.utils.hexlify(ethers.utils.arrayify(postId).subarray(0, 20)))
	const client = contractAddressToClientMap[contractAddress]
	if (!client) throw new Error(`Client for contract "${contractAddress}" can't be found.`)

	const responsePost = await (await client.urqlClient.query(query, {})).data.post

	const post: PostData = {
		id: PostId(responsePost.id),
		parentId: responsePost.parentId === "0x" ? null : PostId(responsePost.parentId),
		index: BigNumber.from(responsePost.index),
		author: Address(responsePost.author),
		contents: responsePost.contents.map((content: any): PostData["contents"][number] => ({
			type: content.type,
			value: ethers.utils.arrayify(content.value),
		})),
		createdAt: new Date(parseInt(responsePost.blockTimestamp) * 1000),
		replyCount: (await getReplyCounts([postId]))[postId] ?? BigNumber.from(0),
		chainKey: client.key,
		tip: responsePost.tip
			? {
					to: Address(responsePost.tip.to),
					value: BigNumber.from(responsePost.tip.value),
			  }
			: null,
	}

	return post
}

export type Timeline = {
	loadBottom(): Promise<void>
	posts: SignalReadable<PostData[]>
	loading: SignalReadable<boolean>
}

export function getTimeline(timelineOptions: { author?: Address; parentId?: PostId; includeReplies?: boolean }): Timeline {
	const query = (count: number, beforeIndex: BigNumber) => gql`
	{
		posts(
			first: ${count.toString()}
			orderBy: blockTimestamp
			orderDirection: desc 
			where: { and: [
				{ or: [{ contents_: { value_not: "" } }, { contents_: { type_not: "" } }] } 
				${timelineOptions.author ? `{ author: "${timelineOptions.author}" }` : ""}
				${timelineOptions.parentId ? `{ parentId: "${timelineOptions.parentId}" }` : ""}
				${timelineOptions.includeReplies ? "" : `{ parentId: "0x" }`}
				{ index_lt: ${beforeIndex.toString()} }
			] }
		) {
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

	const posts = $.writable<PostData[]>([])
	const postQueuesOfChains = clients.map(() => [] as PostData[])
	const isChainFinished = new Array(clients.length).fill(false)
	const lastIndex = new Array(clients.length).fill(Number.MAX_SAFE_INTEGER)

	let loading = $.writable(false)
	async function loadBottom(count = 128) {
		await Promise.resolve() // TODO: need this to stop infinite loop, caused by loading.ref, needs to be fixed later.
		// the problem is if this function gets called in a derive, it calls loading.ref then sets loading.ref which causes infite dependency loop
		if (loading.ref) return
		loading.ref = true
		try {
			await Promise.all(
				clients.map(async ({ urqlClient: client, key }, index) => {
					const postQueue = postQueuesOfChains[index]!
					if (postQueue.length >= count) return
					if (isChainFinished[index]) return

					const response = await client.query(query(count, lastIndex[index]!), {}).toPromise()
					if (response.data.posts.length === 0) return

					const replyCounts = await getReplyCounts(response.data.posts.map((post: any) => PostId(post.id)))

					const newPosts = response.data.posts.map(
						(post: any): PostData => ({
							id: PostId(post.id),
							parentId: post.parentId === "0x" ? null : PostId(post.parentId),
							index: BigNumber.from(post.index),
							author: Address(post.author),
							contents: post.contents.map((content: any): PostData["contents"][number] => ({
								type: content.type,
								value: ethers.utils.arrayify(content.value),
							})),
							createdAt: new Date(parseInt(post.blockTimestamp) * 1000),
							replyCount: replyCounts[post.id] ?? BigNumber.from(0),
							chainKey: key,
							tip: post.tip
								? {
										to: Address(post.tip.to),
										value: BigNumber.from(post.tip.value),
								  }
								: null,
						})
					) as PostData[]

					if (newPosts.length < count) isChainFinished[index] = true
					lastIndex[index] = newPosts[newPosts.length - 1]!.index

					postQueue.push(...newPosts)
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
