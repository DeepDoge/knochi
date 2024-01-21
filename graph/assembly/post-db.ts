import { Address, BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts"
import { EternisPost } from "../generated/IEternis/IEternis"
import { Post, PostContent, PostCounter } from "../generated/schema"

const EMPTY_BYTES = new Bytes(0)
const PARENT_KEY = Bytes.fromUint8Array(
	Uint8Array.wrap(String.UTF8.encode("to")),
)
const BIGINT_ONE = BigInt.fromI32(1)

export function handlePost(chainId: Bytes, event: EternisPost): void {
	let postCounter = PostCounter.load(EMPTY_BYTES)
	if (!postCounter) {
		postCounter = new PostCounter(EMPTY_BYTES)
		postCounter.count = BIGINT_ONE
		postCounter.save()
	}
	const postIndex = postCounter.count

	const postIndexBytes = Bytes.fromByteArray(ByteArray.fromBigInt(postIndex))
	const postId = new Bytes(1 + chainId.byteLength + postIndexBytes.byteLength)
	postId[0] = u8(chainId.byteLength)
	postId.set(chainId, 1)
	postId.set(postIndexBytes, 1 + chainId.byteLength)

	savePost(
		postIndex,
		event.address,
		event.transaction.from,
		event.block.timestamp,
		postId,
		event.params.postData,
	)

	postCounter.count = postIndex.plus(BIGINT_ONE)
	postCounter.save()
}

export function savePost(
	postIndex: BigInt,
	contractAddress: Address,
	transactionFrom: Address,
	blockTimestamp: BigInt,
	postId: Bytes,
	postData: Bytes,
): Bytes {
	let post = new Post(postId)

	post.contract = contractAddress
	post.index = postIndex
	post.parentId = EMPTY_BYTES
	post.author = transactionFrom
	post.blockTimestamp = blockTimestamp
	const contentsIds = new Array<Bytes>()

	const postDataView = new DataView(postData.buffer)

	// type \0 length (u16) value type \0 length (u16) value type \0 length (u16) value ...

	let offset_i32 = i32(0)

	let contentIndex_u8 = u8(0)
	while (offset_i32 < postDataView.byteLength) {
		const content = new PostContent(
			postId.concat(Bytes.fromI32(contentsIds.length)),
		)

		// type loop
		const typeStart_i32 = offset_i32
		while (offset_i32 < postData.length) {
			offset_i32 = add(offset_i32, i32(1))
			const byte_u8 = u8(postDataView.getUint8(offset_i32))
			if (byte_u8 === u8(0)) break
		}
		content.type = Bytes.fromUint8Array(
			postData.subarray(typeStart_i32, offset_i32),
		)
		offset_i32 = add(offset_i32, i32(1))

		const valueLength = postDataView.getUint16(offset_i32)
		offset_i32 = add(offset_i32, i32(2))

		content.value = Bytes.fromUint8Array(
			postData.subarray(offset_i32, offset_i32 + valueLength),
		)
		offset_i32 = add(offset_i32, valueLength)

		const contentId = new Bytes(1).concat(postId)
		contentId[0] = u8(contentIndex_u8)
		content.id = contentId

		content.save()

		contentsIds.push(contentId)
		if (content.type.equals(PARENT_KEY)) {
			post.parentId = content.value
		}
	}

	post.contents = contentsIds
	post.save()

	return post.id
}
