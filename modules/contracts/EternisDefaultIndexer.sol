// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisIndexer.sol";

contract EternisDefaultIndexer is IEternisIndexer {
	struct Post {
		address origin;
		uint96 postId;
		address sender;
		uint96 time;
	}

	mapping(bytes32 => Post[]) public feeds;

	function index(bytes32[] calldata feedIds, uint96 postId) external {
		Post memory post = Post({
			origin: tx.origin,
			sender: msg.sender,
			postId: postId,
			time: uint96(block.timestamp)
		});
		for (uint256 i = 0; i < feedIds.length; i++) {
			bytes32 feedId = feedIds[i];
			if (feedId & 0xFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000000000000000000000000000 == 0) {
				address exportedAddress = address(uint160(uint256(feedId)));
				if (tx.origin != exportedAddress) {
					continue;
				}
			}
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
	) external view returns (address origin, address sender, uint96 postId, uint256 time) {
		Post memory post = feeds[feedId][postIndex];
		return (post.origin, post.sender, post.postId, post.time);
	}
}
