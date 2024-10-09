// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface PostStore {
	function get(uint96 postId) external view returns (bytes calldata postData);
}
