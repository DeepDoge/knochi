import { address, Address } from "@/utils/address"
import { BigNumber, ethers } from "ethers"
import { cacheExchange, createClient, fetchExchange, gql } from "urql"

const client = createClient({
	url: "https://api.studio.thegraph.com/query/45351/dforum/v0.0.29",
	exchanges: [cacheExchange, fetchExchange]
})

export type PostData = {
	id: BigNumber
	parentId: BigNumber | null
	replyCount: BigNumber
	author: Address
	contents: { type: string; value: Uint8Array }[]
	createdAt: Date
}

export async function getPosts(author: Address): Promise<PostData[]> {
	return (
		await client
			.query(
				gql`
					{
						posts(
							first: 5
							orderBy: blockTimestamp
                            orderDirection: desc 
							where: { and: [
                                { or: [{ contents_: { value_not: "" } }, { contents_: { type_not: "" } }] }, 
                                { author: "${author}" } 
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
					}
				`,
				{}
			)
			.toPromise()
	).data.posts.map(
		(post: any): PostData => ({
			id: BigNumber.from(post.id),
			parentId: post.parentId === "0x" ? null : BigNumber.from(post.parentId),
			replyCount: BigNumber.from(post.metadata.replyCount),
			author: address(post.author),
			contents: post.contents.map((content: any): PostData["contents"][number] => ({
				type: content.type,
				value: ethers.utils.arrayify(content.value)
			})),
			createdAt: new Date(parseInt(post.blockTimestamp) * 1000)
		})
	)
}
