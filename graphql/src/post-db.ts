import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Post as PostEvent } from "../generated/PostDB/PostDB"
import { Post, PostContent, PostMetadata } from "../generated/schema"

export function handlePost(event: PostEvent): void {
	let postId = Bytes.fromByteArray(Bytes.fromBigInt(event.params.postId))
	let post = new Post(postId)
	post.parentId = new Bytes(0)

	const postData = event.params.postData
	const view = new DataView(postData.buffer)
	const contentIds: string[] = []

	let offset = 0
	let offsetCache = -1

	const types: string[] = []
	while (offset < postData.length) {
		const byte = view.getUint8(offset)
		if (byte === 10 || byte === 0) {
			types.push(String.UTF8.decode(postData.slice(offsetCache + 1, (offsetCache = offset)).buffer))
			if (byte === 10) break
		}
		offset++
	}

	offset++

	let i = 0
	while (offset < postData.length) {
		if (offset + 1 > postData.length) break
		const typeIndex = view.getUint8(offset)
		offset += 1

		if (offset + 2 > postData.length) break
		const valueBufferSize = view.getUint16(offset)
		offset += 2

		if (typeIndex >= u8(types.length)) break
		const type = types[typeIndex]

		if (offset + valueBufferSize > postData.length) break
		const value = postData.subarray(offset, offset + valueBufferSize)
		offset += valueBufferSize

		const idSuffix = new Uint8Array(1)
		new DataView(idSuffix.buffer).setUint8(0, u8(i))
		const content = new PostContent(`${postId.toHex()}-${i}`)
		content.type = type
		content.value = Bytes.fromUint8Array(value)
		content.save()
		contentIds.push(content.id)

		if (type == "parent") post.parentId = content.value

		i++
	}

	post.author = event.transaction.from
	post.contents = contentIds

	post.blockNumber = event.block.number
	post.blockTimestamp = event.block.timestamp
	post.transactionHash = event.transaction.hash

	const postMetadata = new PostMetadata(post.id)
	postMetadata.replyCount = BigInt.fromI32(0)
	postMetadata.save()

	post.metadata = post.id

	post.save()

	if (post.parentId.length > 0) {
		const parentPostMetadata = PostMetadata.load(post.parentId)
		if (!parentPostMetadata) return
		parentPostMetadata.replyCount = parentPostMetadata.replyCount.plus(BigInt.fromI32(1))
		parentPostMetadata.save()
	}
}
