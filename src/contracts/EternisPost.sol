// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisTransactionEmitter.sol";

contract EternisPost is IEternisTransactionEmitter {
    uint256 public postIndex;

    function post(bytes calldata postData) external {
        emit EternisTransaction(postIndex++, postData);
    }
}