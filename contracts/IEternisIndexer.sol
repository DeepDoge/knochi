// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IEternisIndexer {
	struct Post {
		address origin;
		address proxy;
		bytes32 postId;
		uint256 time;
	}

	function index(bytes32[] calldata feedIds, bytes32 postId) external;
	function length(bytes32 feedId) external view returns (uint256);
	function get(
		bytes32 feedId,
		uint256 index
	)
		external
		view
		returns (address origin, address proxy, bytes32 postId, uint256 time);
}
