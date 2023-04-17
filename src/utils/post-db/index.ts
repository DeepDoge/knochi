export type PostContent = {
	type: string
	value: Uint8Array
}

export function decodePostContent(buffer: Uint8Array): PostContent[] {
	const view = new DataView(buffer.buffer)
	const contents: PostContent[] = []

	let offset = 0
	let offsetCache = -1

	const types: string[] = []
	while (offset < buffer.length) {
		const byte = buffer[offset]
		if (byte === 10 || byte === 0) {
			types.push(new TextDecoder().decode(buffer.subarray(offsetCache + 1, (offsetCache = offset))))
			if (byte === 10) break
		}
		offset++
	}

	offset++

	while (offset < buffer.length) {
		if (offset + 2 > buffer.length) return []
		const typeIndex = buffer[offset++]!
		const valueBufferSize = view.getUint16(offset)
		offset += 2
		const type = types[typeIndex]
		if (!type) return []
		if (offset + valueBufferSize > buffer.length) return []
		const value = buffer.subarray(offset, offset + valueBufferSize)
		contents.push({ type, value })
		offset += valueBufferSize
	}

	return contents
}

export function encodePostContent(contents: PostContent[]): Uint8Array {
	const typeNameToIndexMap = new Map<string, number>()
	let typeIndex = 0

	for (const content of contents) {
		if (!typeNameToIndexMap.has(content.type)) typeNameToIndexMap.set(content.type, typeIndex++)
	}

	const bytes: number[] = []
	typeNameToIndexMap.forEach((index, name) => {
		bytes.push(...new TextEncoder().encode(name), index !== typeNameToIndexMap.size - 1 ? 0 : 10)
	})

	for (const content of contents) {
		const size = new Uint8Array(2)
		new DataView(size.buffer).setInt16(0, content.value.byteLength)
		bytes.push(typeNameToIndexMap.get(content.type)!, ...size, ...content.value)
	}

	return new Uint8Array(bytes)
}
