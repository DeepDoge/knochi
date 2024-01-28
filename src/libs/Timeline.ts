import { globalSheet } from "@/styles"
import { client } from "@/utils/graph"
import { Post } from "@/utils/post"
import { gql } from "@urql/core"
import { css, customTag, populate, sheet, tags } from "cherry-ts"
import { toBeArray, toUtf8String } from "ethers"
import { object, string } from "zod"

const { div, span } = tags

const query = gql`
	{
		posts(orderBy: index, orderDirection: desc) {
			id
			parentId
			index
			author
			contract
			blockTimestamp

			contents {
				type
				value
			}
		}
	}
`

const queryData = object({
	posts: object({
		id: string(),
		parentId: string(),
		index: string().transform(BigInt),
		author: string(),
		contract: string(),
		blockTimestamp: string().transform(
			(value) => new Date(Number(value) * 1000),
		),
		contents: object({
			type: string().transform((value) => toUtf8String(value)),
			value: string().transform(toBeArray),
		})
			.transform((content) =>
				content.type === Post.Content.TypeMap.text
					? {
							type: content.type,
							value: toUtf8String(content.value),
						}
					: null,
			)
			.array()
			.transform((value) => value.filter(Boolean)),
	}).array(),
})

const timelineTag = customTag("x-timeline")
export async function Timeline() {
	const root = timelineTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(timelineSheet, globalSheet)

	const result = await client.query(query, {}).toPromise()
	const posts = (await queryData.parseAsync(result.data)).posts

	populate(dom, [
		posts.map((post) =>
			div([
				post.contents.map((content) =>
					content.type === Post.Content.TypeMap.text
						? span([content.value])
						: null,
				),
			]),
		),
	])

	return root
}

const timelineSheet = sheet(css``)
