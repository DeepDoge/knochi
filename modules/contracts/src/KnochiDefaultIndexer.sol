// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IKnochiIndexer.sol";

contract KnochiDefaultIndexer is IKnochiIndexer {
	struct Post {
		address origin;
		uint96 postId;
		address sender;
		uint96 time;
	}

	mapping(bytes32 => Post[]) public feeds;

	function index(bytes32[] memory feedIds, uint96 postId) external {
		Post memory post = Post({
			origin: tx.origin,
			postId: postId,
			sender: msg.sender,
			time: uint96(block.timestamp)
		});

		for (uint256 i = 0; i < feedIds.length; i++) {
			bytes32 feedId = feedIds[i];

			if (bytes12(feedId << 20) == bytes12(0) && bytes20(feedId) != bytes20(tx.origin)) {
				continue;
			}

			feeds[feedId].push(post);
			emit KnochiPost(feedId, postId);
		}
	}

	function length(bytes32 feedId) external view returns (uint256) {
		return feeds[feedId].length;
	}

	function get(
		bytes32 feedId,
		uint256 postIndex
	) external view returns (address origin, uint96 postId, address sender, uint96 time) {
		Post memory post = feeds[feedId][postIndex];
		return (post.origin, post.postId, post.sender, post.time);
	}
}
