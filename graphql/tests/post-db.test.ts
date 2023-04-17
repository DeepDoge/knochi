import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Post } from "../generated/schema"
import { Post as PostEvent } from "../generated/PostDB/PostDB"
import { handlePost } from "../src/assembly/post-db"
import { createPostEvent } from "./post-db-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
	beforeAll(() => {
		let author = Address.fromString("0x0000000000000000000000000000000000000001")
		let postId = BigInt.fromI32(234)
		let postData = Bytes.fromI32(1234567890)
		let newPostEvent = createPostEvent(author, postId, postData)
		handlePost(newPostEvent)
	})

	afterAll(() => {
		clearStore()
	})

	// For more test scenarios, see:
	// https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

	test("Post created and stored", () => {
		assert.entityCount("Post", 1)

		// 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
		assert.fieldEquals("Post", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1", "author", "0x0000000000000000000000000000000000000001")
		assert.fieldEquals("Post", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1", "postId", "234")
		assert.fieldEquals("Post", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1", "postData", "1234567890")

		// More assert options:
		// https://thegraph.com/docs/en/developer/matchstick/#asserts
	})
})
