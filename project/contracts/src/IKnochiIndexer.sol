// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IKnochiIndexer {
	event KnochiPost(bytes32 indexed feedId, uint96 postId);

	function index(bytes32[] calldata feedIds, uint96 postId) external;
	function length(bytes32 feedId) external view returns (uint256);
	function get(
		bytes32 feedId,
		uint256 index
	) external view returns (address origin, uint96 postId, address sender, uint96 time);
}