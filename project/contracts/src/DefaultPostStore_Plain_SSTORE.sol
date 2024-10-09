// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./PostStore_Plain.sol";
import "./PostIndexer.sol";

contract DefaultPostStore_Plain_SSTORE is PostStore_Plain {
	mapping(uint96 => bytes) public store;
	uint96 public counter;

	function post(PostIndexer indexer, bytes32[] calldata feedIds, bytes memory postData) external {
		uint96 postId = counter++;
		store[postId] = postData;
		indexer.index(feedIds, this, postId, msg.sender);
	}

	function get(uint96 postId) external view returns (bytes memory postData) {
		return store[postId];
	}
}
