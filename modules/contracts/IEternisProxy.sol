// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IEternisIndexer.sol";

interface IEternisProxy {
	function post(IEternisIndexer indexer, bytes32[] calldata feedIds, bytes calldata postData) external;
	function get(uint96 postId) external view returns (bytes calldata postData);
}
