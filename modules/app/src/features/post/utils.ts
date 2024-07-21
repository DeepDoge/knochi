import { Utils } from "@/utils/types";
import { BytesLike, toBeArray, toUtf8Bytes } from "ethers";

export type PostContent = PostContent.Part[];
export namespace PostContent {
	export type Part = {
		type: string;
		value: string;
	};

	export namespace Part {
		export type TypeMap = typeof TypeMap;
		export const TypeMap = {
			Text: "t",
			Image: "i",
			Audio: "a",
			Video: "v",
			Mention: "@",
			Link: "l",
			File: "f",
			Quote: "q",
		} as const;
		true satisfies Utils.IsBijective<TypeMap>;
	}

	export function toBytes(content: PostContent) {
		const postBytes: number[] = [];
		for (const part of content) {
			const contentBytes: number[] = [];
			const typeBytes = toUtf8Bytes(part.type);
			const valueBytes = toUtf8Bytes(part.value);
			contentBytes.push(...typeBytes);
			contentBytes.push(0);
			contentBytes.push(...new Uint8Array(new Uint16Array([valueBytes.byteLength]).buffer));
			contentBytes.push(...valueBytes);
			postBytes.push(...contentBytes);
		}
		return new Uint8Array(postBytes);
	}

	export function fromBytes(bytesLike: BytesLike): PostContent {
		const bytes = bytesLike instanceof Uint8Array ? bytesLike : toBeArray(bytesLike);
		const content: PostContent = [];
		let offset = 0;

		while (offset < bytes.length) {
			// Extract the type
			const typeEnd = bytes.indexOf(0, offset);
			if (typeEnd === -1) throw new Error("Invalid byte sequence");
			const typeBytes = bytes.slice(offset, typeEnd);
			const type = new TextDecoder().decode(typeBytes);
			offset = typeEnd + 1;

			// Extract the value length
			if (offset + 2 > bytes.length) throw new Error("Invalid byte sequence");
			const valueLength = new DataView(bytes.buffer).getUint16(offset, true);
			offset += 2;

			// Extract the value
			if (offset + valueLength > bytes.length) throw new Error("Invalid byte sequence");
			const valueBytes = bytes.slice(offset, offset + valueLength);
			const value = new TextDecoder().decode(valueBytes);
			offset += valueLength;

			// Add the part to content
			content.push({ type, value });
		}

		return content;
	}
}
