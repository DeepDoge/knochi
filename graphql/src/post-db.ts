import { Bytes } from "@graphprotocol/graph-ts"
import { Post as PostEvent } from "../generated/PostDB/PostDB"
import { Post, PostContent } from "../generated/schema"

@inline
export function decodePostContent(buffer: Uint8Array, postId: Bytes): string[] {
	const view = new DataView(buffer.buffer)
	const ids = new Array<string>()

	let offset = 0
	let offsetCache = -1

	const types = new Array<string>()
	while (offset < buffer.length) {
		const byte = buffer[offset]
		if (byte === 10 || byte === 0) {
			types.push(String.UTF8.decode(buffer.slice(offsetCache + 1, (offsetCache = offset)).buffer))
			if (byte === 10) break
		}
		offset++
	}

	offset++

	let i = 0
	while (offset < buffer.length) {
		if (offset + 2 > buffer.length) return []
		const typeIndex = buffer[offset++]
		const valueBufferSize = view.getUint16(offset)
		offset += 2
		const type = types[typeIndex]
		if (!type) return []
		if (offset + valueBufferSize > buffer.length) return []
		const value = buffer.subarray(offset, offset + valueBufferSize)

		const idSuffix = new Uint8Array(1)
		new DataView(idSuffix.buffer).setUint8(0, u8(i))
		const content = new PostContent(`${postId.toHex()}-${i}`)
		content.type = type
		content.value = Bytes.fromUint8Array(value)
		content.save()
		ids.push(content.id)

		offset += valueBufferSize
		i++
	}

	return ids
}

export function handlePost(event: PostEvent): void {
	let id = Bytes.fromByteArray(Bytes.fromBigInt(event.params.postId))
	let post = new Post(id)

	post.author = event.transaction.from
	post.postContent = decodePostContent(event.params.postData, id)

	post.blockNumber = event.block.number
	post.blockTimestamp = event.block.timestamp
	post.transactionHash = event.transaction.hash

	post.save()
}
