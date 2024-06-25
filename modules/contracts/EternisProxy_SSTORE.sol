// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisProxy.sol";
import "./IEternisIndexer.sol";

contract EternisProxy_SSTORE is IEternisProxy {
	mapping(uint96 => bytes) public store;
	uint96 public counter;

	function post(IEternisIndexer indexer, bytes32[] calldata feedIds, bytes memory postData) external {
		uint96 postId = counter++;
		store[postId] = postData;
		indexer.index(feedIds, postId);
	}

	function get(uint96 postId) external view returns (bytes memory postData) {
		return store[postId];
	}
}
