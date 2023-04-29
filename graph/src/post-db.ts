import { Address, BigInt, Bytes, dataSource } from "@graphprotocol/graph-ts"
import { Post as PostEvent } from "../generated/PostDB/PostDB"
import {
	ChainPostIndexCounter,
	ContractPostCounter,
	Post,
	PostContent,
	PostReplyCounter,
	PostReplyCounterFourHour,
	TipPost
} from "../generated/schema"
import { Post as TipPostEvent } from "../generated/TipPostDB/TipPostDB"

const EMPTY_BYTES = new Bytes(0)

export function handleTipPost(event: TipPostEvent): void {
	const postId = savePost(event.transaction.from, event.block.timestamp, event.params.postData)
	const tipPost = new TipPost(postId)
	tipPost.to = event.params.tipTo
	tipPost.value = event.transaction.value
}

export function handlePost(event: PostEvent): void {
	savePost(event.transaction.from, event.block.timestamp, event.params.postData)
}

export function savePost(transactionFrom: Address, blockTimestamp: BigInt, postData: Bytes): Bytes {
	let chainPostCounter = ChainPostIndexCounter.load(EMPTY_BYTES)
	if (!chainPostCounter) {
		chainPostCounter = new ChainPostIndexCounter(EMPTY_BYTES)
		chainPostCounter.count = BigInt.fromI32(0)
	}

	let contractPostCounter = ContractPostCounter.load(dataSource.address())
	if (!contractPostCounter) {
		contractPostCounter = new ContractPostCounter(dataSource.address())
		contractPostCounter.count = BigInt.fromI32(0)
	}

	let post = new Post(dataSource.address().concat(Bytes.fromByteArray(Bytes.fromBigInt(contractPostCounter.count))))

	post.index = chainPostCounter.count
	post.parentId = EMPTY_BYTES
	post.author = transactionFrom
	post.blockTimestamp = blockTimestamp

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
		const content = new PostContent(`${post.id.toHex()}-${i}`)
		content.type = type
		content.value = Bytes.fromUint8Array(value)
		content.save()
		contentIds.push(content.id)

		if (type == "parent") post.parentId = content.value

		i++
	}

	post.contents = contentIds
	post.save()

	if (post.parentId.length > 0) {
		let replyCounter = PostReplyCounter.load(post.parentId)
		if (!replyCounter) {
			replyCounter = new PostReplyCounter(post.parentId)
			replyCounter.count = BigInt.fromI32(1)
		} else {
			replyCounter.count = replyCounter.count.plus(BigInt.fromI32(1))
		}
		replyCounter.save()

		let replyCounterFourHour = PostReplyCounterFourHour.load(post.parentId)
		if (!replyCounterFourHour) {
			replyCounterFourHour = new PostReplyCounterFourHour(post.parentId)
			replyCounterFourHour.timeframeId = post.blockTimestamp.div(BigInt.fromI32(14400))
			replyCounterFourHour.count = BigInt.fromI32(1)
		} else {
			replyCounterFourHour.count = replyCounterFourHour.count.plus(BigInt.fromI32(1))
		}
		replyCounterFourHour.save()
	}

	contractPostCounter.count = contractPostCounter.count.plus(BigInt.fromI32(1))
	contractPostCounter.save()

	chainPostCounter.count = chainPostCounter.count.plus(BigInt.fromI32(1))
	chainPostCounter.save()

	return post.id
}
