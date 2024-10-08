// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IKnochiIndexer.sol";

contract KnochiDefaultIndexer is IKnochiIndexer {
	mapping(address => mapping(address => bool)) public allowedSenders;

	function grantPermission(address sender) external {
		allowedSenders[msg.sender][sender] = true;
	}

	function revokePermission(address sender) external {
		delete allowedSenders[msg.sender][sender];
	}

	function checkPermission(address author, address sender) external view returns (bool) {
		return allowedSenders[author][sender] == true;
	}

	struct Post {
		address author;
		uint96 postId;
		address sender;
		uint96 time;
	}

	mapping(bytes32 => Post[]) public feeds;

	function index(bytes32[] memory feedIds, uint96 postId, address author) external {
		require(allowedSenders[author][msg.sender] == true, "Sender not allowed to index for this author");

		Post memory post = Post({ author: author, postId: postId, sender: msg.sender, time: uint96(block.timestamp) });

		for (uint256 i = 0; i < feedIds.length; i++) {
			bytes32 feedId = feedIds[i];

			if (feedId[0] == 0x00 && bytes20(feedId << 8) != bytes20(author)) {
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
	) external view returns (address author, uint96 postId, address sender, uint96 time) {
		Post memory post = feeds[feedId][postIndex];
		return (post.author, post.postId, post.sender, post.time);
	}
}
