// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IKnochiIndexer.sol";
import "./IKnochiStore.sol";

interface IKnochiSender is IKnochiStore {
	function post(IKnochiIndexer indexer, bytes32[] calldata feedIds, bytes calldata postData) external;
}
