import { Bytes } from "@graphprotocol/graph-ts"
import { EternisPost } from "../generated/IEternis/IEternis"
import { handlePost } from "./post-db"

const chainId = Bytes.fromHexString("0xAA36A7")

export function map(event: EternisPost): void {
	handlePost(chainId, event)
}
