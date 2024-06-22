import { toUtf8Bytes } from "ethers"
import { Utils } from "./types"

export type Post = Post.Content[]
export namespace Post {
	export type Content = {
		type: string
		value: string
	}

	export namespace Content {
		export type TypeMap = typeof TypeMap
		export const TypeMap = {
			Text: "t",
			Image: "i",
			Audio: "a",
			Video: "v",
			Mention: "@",
			Link: "l",
			File: "f",
			Quote: "q",
		} as const
		true satisfies Utils.IsBijective<TypeMap>
	}
}

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
