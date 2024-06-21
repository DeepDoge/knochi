// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisIndexer.sol";

contract EternisDefaultIndexer is IEternisIndexer {
	struct Post {
		address origin;
		address proxy;
		bytes32 postId;
		uint256 time;
	}

	mapping(bytes32 => Post[]) public feeds;

	function index(bytes32[] calldata feedIds, bytes32 postId) external {
		Post memory post = Post({
			origin: tx.origin,
			proxy: msg.sender,
			postId: postId,
			time: block.timestamp
		});
		for (uint256 i = 0; i < feedIds.length; i++) {
			bytes32 feedId = feedIds[i];
			feeds[feedId].push(post);
			emit EternisPost(feedId, postId);
		}
	}

	function length(bytes32 feedId) external view returns (uint256) {
		return feeds[feedId].length;
	}

	function get(
		bytes32 feedId,
		uint256 postIndex
	)
		external
		view
		returns (address origin, address proxy, bytes32 postId, uint256 time)
	{
		Post memory post = feeds[feedId][postIndex];
		return (post.origin, post.proxy, post.postId, post.time);
	}
}
