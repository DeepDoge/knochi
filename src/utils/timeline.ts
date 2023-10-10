import { Networks } from "@/networks"
import { ethers } from "ethers"
import { signal, type Signal } from "master-ts/core"
import { gql } from "urql"
import { Address } from "./address"
import { BigMath } from "./bigmath"
import { Post } from "./post"
import { PostId } from "./post-id"

export type Timeline = {
	loadBottom(): Promise<void>
	posts: Readonly<Signal<Post[]>>
	loading: Readonly<Signal<boolean>>
	newPostCountAtTop: Readonly<Signal<number>>
}

export namespace Timeline {
	export type QueryOptions<TParentID extends PostId> = {
		author?: Address
		parentId?: TParentID
		replies?: [TParentID] extends [never] ? "include" | "only" : never
		mention?: Address
		search?: string[]
		top?: "minute" | "hour" | "day" | "week" | "month" | "year" | "all-time"
	}

	export function create<TParentID extends PostId = never>(options: QueryOptions<TParentID>, rule: "and" | "or" = "and"): Timeline {
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
                    ${
						beforeIndex
							? beforeIndex >= 0n
								? `{ index_lt: ${beforeIndex.toString()} }`
								: `{ index_gt: ${BigMath.abs(beforeIndex).toString()} }`
							: ""
					} 
                ]}
            ] }
        ) {
            id
            index
            contract
        }
    }`

		const posts = signal<Post[]>([])
		const postQueuesOfChains = Networks.graphClients.map(() => [] as Post[])
		const isChainFinished = new Array(Networks.graphClients.length).fill(false)
		const lastIndex = new Array<bigint>(Networks.graphClients.length)

		const loadedOnce = signal(false)

		let loading = signal(false)
		async function loadBottom(count = 128) {
			if (loading.ref) return
			loading.ref = true
			try {
				await Promise.all(
					Networks.graphClients.map(async (client, index) => {
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

						postQueue.push(...(await Post.getPosts(listOfNewPosts.map((post) => post.id))))
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

				if (posts.ref.length !== postsLengthCache) posts.ping()
			} catch (error) {
				console.error(error)
			} finally {
				loading.ref = false
				loadedOnce.ref = true
			}
		}

		const newPostsAtTop = signal(0)

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
