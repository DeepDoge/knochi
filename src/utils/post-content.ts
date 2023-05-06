import { ethers } from "ethers"

export type PostContent = {
	type: string
	value: Uint8Array
}

export namespace PostContent {
	export function decode(buffer: Uint8Array): PostContent[] {
		const view = new DataView(buffer.buffer)
		const contents: PostContent[] = []

		let offset = 0
		let offsetCache = -1

		const types: string[] = []
		while (offset < buffer.length) {
			const byte = view.getUint8(offset)
			if (byte === 10 || byte === 0) {
				types.push(ethers.toUtf8String(buffer.subarray(offsetCache + 1, (offsetCache = offset))))
				if (byte === 10) break
			}
			offset++
		}

		offset++

		while (offset < buffer.length) {
			if (offset + 1 > buffer.length) return []
			const typeIndex = view.getUint8(offset)
			offset += 1

			if (offset + 1 > buffer.length) return []
			const valueBufferSize = view.getUint16(offset)
			offset += 2

			if (typeIndex >= types.length) return []
			const type = types[typeIndex]!

			if (offset + valueBufferSize > buffer.length) return []
			const value = buffer.subarray(offset, offset + valueBufferSize)
			offset += valueBufferSize

			contents.push({ type, value })
		}

		return contents
	}

	export function encode(contents: PostContent[]): Uint8Array {
		const typeNameToIndexMap = new Map<string, number>()
		let typeIndex = 0

		for (const content of contents) {
			if (!typeNameToIndexMap.has(content.type)) typeNameToIndexMap.set(content.type, typeIndex++)
		}

		const bytes: number[] = []
		typeNameToIndexMap.forEach((index, name) => {
			bytes.push(...ethers.toUtf8Bytes(name), index !== typeNameToIndexMap.size - 1 ? 0 : 10)
		})

		for (const content of contents) {
			const size = new Uint8Array(2)
			new DataView(size.buffer).setUint16(0, content.value.byteLength)
			bytes.push(typeNameToIndexMap.get(content.type)!, ...size, ...content.value)
		}

		return new Uint8Array(bytes)
	}
}
