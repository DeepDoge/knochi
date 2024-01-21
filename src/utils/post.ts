import { toUtf8Bytes } from "ethers"
import { Utils } from "./types"

export type Post = Post.Content[]
export namespace Post {
	export type Content = {
		type: string
		value: string
	}
}

export type PostContentTypeMap = typeof PostContentTypeMap
export const PostContentTypeMap = {
	text: "t",
	image: "i",
	audio: "a",
	video: "v",
	mention: "@",
	link: "l",
	file: "f",
	quote: "q",
} as const
true satisfies Utils.IsBijective<PostContentTypeMap>

export function encodePost(post: Post): Uint8Array {
	const postBytes: number[] = []
	for (const content of post) {
		const contentBytes: number[] = []
		const typeBytes = toUtf8Bytes(content.type)
		const valueBytes = toUtf8Bytes(content.value)
		contentBytes.push(...typeBytes)
		contentBytes.push(0)
		contentBytes.push(
			...new Uint8Array(new Uint16Array([valueBytes.byteLength]).buffer),
		)
		contentBytes.push(...valueBytes)
		postBytes.push(...contentBytes)
	}
	return new Uint8Array(postBytes)
}
