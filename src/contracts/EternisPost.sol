// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternis.sol";

contract EternisPost is IEternis {
    uint256 public postIndex;

    function post(bytes calldata postData) external {
        emit EternisTransaction(postIndex++, postData);
    }
}