import { Bytes } from "@graphprotocol/graph-ts"
import { EternisPost } from "../generated/IEternisPostDB/IEternisPostDB"
import { handlePost } from "./post-db"

const chainId = Bytes.fromHexString("0x13881")

export function map(event: EternisPost): void {
	handlePost(chainId, event)
}
