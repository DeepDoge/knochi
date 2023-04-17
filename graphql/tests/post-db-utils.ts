import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Post } from "../generated/PostDB/PostDB"

export function createPostEvent(
  author: Address,
  postId: BigInt,
  postData: Bytes
): Post {
  let postEvent = changetype<Post>(newMockEvent())

  postEvent.parameters = new Array()

  postEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  postEvent.parameters.push(
    new ethereum.EventParam("postId", ethereum.Value.fromUnsignedBigInt(postId))
  )
  postEvent.parameters.push(
    new ethereum.EventParam("postData", ethereum.Value.fromBytes(postData))
  )

  return postEvent
}
