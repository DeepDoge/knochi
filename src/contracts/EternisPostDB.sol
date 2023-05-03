// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisPostDB.sol";

contract EternisPostDB is IEternisPostDB {
    uint256 public postIndex;

    function post(bytes calldata postData) external {
        emit EternisPost(postIndex++, postData);
    }
}