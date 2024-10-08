// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IKnochiSender.sol";
import "./IKnochiIndexer.sol";

contract KnochiSender_SSTORE is IKnochiSender {
	mapping(uint96 => bytes) public store;
	uint96 public counter;

	function post(IKnochiIndexer indexer, bytes32[] calldata feedIds, bytes memory postData) external {
		uint96 postId = counter++;
		store[postId] = postData;
		indexer.index(feedIds, postId, msg.sender);
	}

	function get(uint96 postId) external view returns (bytes memory postData) {
		return store[postId];
	}
}
