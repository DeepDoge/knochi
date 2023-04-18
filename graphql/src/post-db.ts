import { Bytes } from "@graphprotocol/graph-ts"
import { Post as PostEvent } from "../generated/PostDB/PostDB"
import { Post, PostContent } from "../generated/schema"

export function handlePost(event: PostEvent): void {
	let postId = Bytes.fromByteArray(Bytes.fromBigInt(event.params.postId))
	let post = new Post(postId)
	const buffer = event.params.postData

	const view = new DataView(buffer.buffer)
	const ids: string[] = []
	let parentPostId: Bytes = new Bytes(0)

	let offset = 0
	let offsetCache = -1

	const types: string[] = []
	while (offset < buffer.length) {
		const byte = view.getUint8(offset)
		if (byte === 10 || byte === 0) {
			types.push(String.UTF8.decode(buffer.slice(offsetCache + 1, (offsetCache = offset)).buffer))
			if (byte === 10) break
		}
		offset++
	}

	offset++

	let i = 0
	while (offset < buffer.length) {
		if (offset + 1 > buffer.length) break
		const typeIndex = view.getUint8(offset)
		offset += 1

		if (offset + 2 > buffer.length) break
		const valueBufferSize = view.getUint16(offset)
		offset += 2

		if (typeIndex >= u8(types.length)) break
		const type = types[typeIndex]

		if (offset + valueBufferSize > buffer.length) break
		const value = buffer.subarray(offset, offset + valueBufferSize)
		offset += valueBufferSize

		const idSuffix = new Uint8Array(1)
		new DataView(idSuffix.buffer).setUint8(0, u8(i))
		const content = new PostContent(`${postId.toHex()}-${i}`)
		content.type = type
		content.value = Bytes.fromUint8Array(value)
		content.save()
		ids.push(content.id)

		if (type === "parent") parentPostId = content.value

		i++
	}

	post.author = event.transaction.from
	post.postContent = ids
	post.parentId = parentPostId

	post.blockNumber = event.block.number
	post.blockTimestamp = event.block.timestamp
	post.transactionHash = event.transaction.hash

	post.save()
}
