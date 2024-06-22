// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisProxy.sol";
import "./IEternisIndexer.sol";

contract EternisProxy_SSTORE is IEternisProxy {
	mapping(bytes32 => bytes) public store;
	uint256 public counter;

	function post(
		IEternisIndexer indexer,
		bytes32[] calldata feedIds,
		bytes memory postData
	) external {
		bytes32 postId = bytes32(counter++);
		store[postId] = postData;
		indexer.index(feedIds, postId);
	}

	function get(bytes32 postId) external view returns (bytes memory postData) {
		return store[postId];
	}
}
