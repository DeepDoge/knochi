import { Bytes } from "@graphprotocol/graph-ts"
import type { EternisPost } from "../generated/IEternisPostDB/IEternisPostDB"
import { handlePost } from "./post-db"

const chainId = Bytes.fromHexString("0xAA36A7")

export function map(event: EternisPost): void {
	handlePost(chainId, event)
}
