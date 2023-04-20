import { address, Address } from "@/utils/address"
import { BigNumber, ethers } from "ethers"
import { $ } from "master-ts/library/$"
import type { SignalReadable } from "master-ts/library/signal/readable"
import { cacheExchange, createClient, fetchExchange, gql } from "urql"
import { networks } from "../networks"

export type PostData = {
	id: BigNumber
	parentId: BigNumber | null
	replyCount: BigNumber
	author: Address
	contents: { type: string; value: Uint8Array }[]
	createdAt: Date
	chainKey: networks.ChainKey
}

const clients = Object.entries(networks.graphApis).map(([key, value]) => ({
	key: key as networks.ChainKey,
	client: createClient({
		url: value.url.href,
		exchanges: [cacheExchange, fetchExchange],
	}),
}))

export type TimelineOptions = {
	author?: Address
	includeReplies?: boolean
}

export type Timeline = {
	loadBottom(): Promise<void>
	posts: SignalReadable<PostData[]>
	loading: SignalReadable<boolean>
}

export function getTimeline(timelineOptions: TimelineOptions): Timeline {
	const query = (count: number, beforeTimestamp: number) => gql`
	{
		posts(
			first: ${count.toString()}
			orderBy: blockTimestamp
			orderDirection: desc 
			where: { and: [
				{ or: [{ contents_: { value_not: "" } }, { contents_: { type_not: "" } }] }, 
				${timelineOptions.author ? `{ author: "${timelineOptions.author}" }` : ""} ,
				${timelineOptions.includeReplies ? "" : `{ parentId: "0x" }`}
				{ blockTimestamp_lt: ${beforeTimestamp.toString()} }
			] }
		) {
			id
			parentId

			author
			contents {
				type
				value
			}
			metadata {
				replyCount
			}
			blockTimestamp
		}
	}`

	const posts = $.writable<PostData[]>([])
	const postQueuesOfChains = clients.map(() => [] as PostData[])
	const isChainFinished = new Array(clients.length).fill(false)
	const lastTimestamp = new Array(clients.length).fill(Number.MAX_SAFE_INTEGER)

	let loading = $.writable(false)
	async function loadBottom(count = 128) {
		if (loading.ref) return
		loading.ref = true
		try {
			await Promise.all(
				clients.map(async ({ client, key }, index) => {
					const postQueue = postQueuesOfChains[index]!
					if (postQueue.length >= count) return
					if (isChainFinished[index]) return

					const newPosts = (await client.query(query(count, lastTimestamp[index]!), {}).toPromise()).data.posts.map(
						(post: any): PostData => ({
							id: BigNumber.from(post.id),
							parentId: post.parentId === "0x" ? null : BigNumber.from(post.parentId),
							replyCount: BigNumber.from(post.metadata.replyCount),
							author: address(post.author),
							contents: post.contents.map((content: any): PostData["contents"][number] => ({
								type: content.type,
								value: ethers.utils.arrayify(content.value),
							})),
							createdAt: new Date(parseInt(post.blockTimestamp) * 1000),
							chainKey: key,
						})
					) as PostData[]

					if (newPosts.length === 0) return

					if (newPosts.length < count) isChainFinished[index] = true
					lastTimestamp[index] = newPosts[newPosts.length - 1]!.createdAt.getTime() / 1000

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
