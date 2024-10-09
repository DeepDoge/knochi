// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./PostIndexer.sol";
import "./PostStore.sol";

interface PostStore_Plain is PostStore {
	function post(PostIndexer indexer, bytes32[] calldata feedIds, bytes calldata postData) external;
}
