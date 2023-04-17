import { address, Address } from "@/utils/address"
import { BigNumber, ethers } from "ethers"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import { html } from "master-ts/library/template"
import { cacheExchange, createClient, fetchExchange, gql } from "urql"

const client = createClient({
	url: "https://api.studio.thegraph.com/query/45351/dforum/v0.0.25",
	exchanges: [cacheExchange, fetchExchange]
})

type Post = {
	id: BigNumber
	author: Address
	contents: { type: string; value: Uint8Array }[]
}

async function getPosts(author: Address): Promise<Post[]> {
	return (
		await client
			.query(
				gql`
					{
						posts(
							first: 5
							orderBy: id
							where: { and: [
                                { or: [{ postContent_: { value_not: "" } }, { postContent_: { type_not: "" } }] }, 
                                { author: "${author}" } 
                            ] }
						) {
							id
							author
							postContent {
								type
								value
							}
						}
					}
				`,
				{}
			)
			.toPromise()
	).data.posts.map(
		(post: any): Post => ({
			id: BigNumber.from(post.id),
			author: address(post.author),
			contents: post.postContent.map((content: any): Post["contents"][number] => ({
				type: content.type,
				value: ethers.utils.arrayify(content.value)
			}))
		})
	)
}

const UserPageComponent = defineComponent()
export function UserPage(userAddress: Address) {
	const component = new UserPageComponent()

	component.$html = html`
		<h1>User Page</h1>
		${ethers.utils.hexlify(userAddress)}

		<pre>
        ${$.await(getPosts(userAddress)).then((posts) =>
				$.each(posts).as((post) =>
					JSON.stringify(
						{
							id: post.id.toHexString(),
							author: ethers.utils.hexlify(post.author),
							contents: post.contents.map((content) => ({
								type: content.type,
								value: content.type === "text" ? new TextDecoder().decode(content.value) : ethers.utils.hexlify(content.value)
							}))
						},
						null,
						"\t"
					)
				)
			)}
        </pre
		>
	`

	return component
}
