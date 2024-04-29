// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisProxy.sol";
import "./IEternisIndexer.sol";

contract EternisDefaultProxy is IEternisProxy {
	// TODO: Use SSTORE2 instead, or auto select it based on the bytes length
	//      Can also have a secondary contract that uses SSTORE2
	mapping(bytes32 => bytes) public store;
	uint256 public counter;

	function post(
		IEternisIndexer indexer,
		bytes32[] calldata feedIds,
		bytes calldata postData
	) external {
		bytes32 postId = bytes32(counter++);
		this.store[postId] = postData;
		indexer.index(feedIds, postId);
	}
	function get(
		bytes32 postId
	) external view returns (bytes calldata postData) {
		return this.store[postId];
	}
}
