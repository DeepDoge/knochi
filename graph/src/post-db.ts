import type { Address } from "@graphprotocol/graph-ts"
import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts"
import type { EternisPost } from "../generated/IEternisPostDB/IEternisPostDB"
import { ChainPostIndexCounter, Post, PostContent, PostReplyCounter, PostReplyCounter_FourHourTimeframe } from "../generated/schema"

const EMPTY_BYTES = new Bytes(0)
const PARENT_TYPE = Bytes.fromUint8Array(Uint8Array.wrap(String.UTF8.encode("parent")))
const BIGINT_ZERO = BigInt.fromI32(0)
const BIGINT_ONE = BigInt.fromI32(1)
const BIGINT_14400 = BigInt.fromI32(14400)

export function handlePost(event: EternisPost): void {
	const postId = event.address.concat(Bytes.fromByteArray(ByteArray.fromBigInt(event.params.postIndex)))
	savePost(event.transaction.from, event.block.timestamp, postId, event.params.postData)
}

export function savePost(transactionFrom: Address, blockTimestamp: BigInt, postId: Bytes, postData: Bytes): Bytes {
	let chainPostCounter = ChainPostIndexCounter.load(EMPTY_BYTES)
	if (!chainPostCounter) {
		chainPostCounter = new ChainPostIndexCounter(EMPTY_BYTES)
		chainPostCounter.count = BIGINT_ZERO
	}

	let post = new Post(postId)

	post.index = chainPostCounter.count
	post.parentId = EMPTY_BYTES
	post.author = transactionFrom
	post.blockTimestamp = blockTimestamp
	const contentsIds = new Array<Bytes>()

	const view = new DataView(postData.buffer)

	let offset = 0
	let offsetCache = -1

	const types: Bytes[] = []
	while (offset < postData.length) {
		const byte = view.getUint8(offset)
		if (byte === 10 || byte === 0) {
			types.push(Bytes.fromUint8Array(postData.subarray(offsetCache + 1, (offsetCache = offset))))
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

		const contentIndex = new Uint8Array(1)
		new DataView(contentIndex.buffer).setUint8(0, u8(i))
		const content = new PostContent(Bytes.fromUint8Array(contentIndex).concat(Bytes.fromByteArray(ByteArray.fromBigInt(post.index))))
		content.type = type
		content.value = Bytes.fromUint8Array(value)
		content.save()
		contentsIds.push(content.id)

		if (type.equals(PARENT_TYPE)) post.parentId = content.value

		i++
	}

	post.contents = contentsIds
	post.save()

	if (post.parentId.length > 0) {
		let replyCounter = PostReplyCounter.load(post.parentId)
		if (!replyCounter) {
			replyCounter = new PostReplyCounter(post.parentId)
			replyCounter.count = BIGINT_ONE
		} else {
			replyCounter.count = replyCounter.count.plus(BIGINT_ONE)
		}
		replyCounter.save()

		const fourHourId = Bytes.fromByteArray(ByteArray.fromU64(post.blockTimestamp.div(BIGINT_14400).toU64())).concat(post.parentId)
		let replyCounterFourHour = PostReplyCounter_FourHourTimeframe.load(fourHourId)
		if (!replyCounterFourHour) {
			replyCounterFourHour = new PostReplyCounter_FourHourTimeframe(fourHourId)
			replyCounterFourHour.count = BIGINT_ONE
		} else {
			replyCounterFourHour.count = replyCounterFourHour.count.plus(BIGINT_ONE)
		}
		replyCounterFourHour.save()
	}

	chainPostCounter.count = chainPostCounter.count.plus(BIGINT_ONE)
	chainPostCounter.save()

	return post.id
}
