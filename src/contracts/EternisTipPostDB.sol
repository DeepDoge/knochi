// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisPostDB.sol";

contract EternisTipPostDB is IEternisPostDB {
    uint256 public postIndex;

    event EternisTipPost(uint256 postIndex, address tipTo);

    function post(bytes calldata postData, address payable tipTo) external payable {
        tipTo.transfer(msg.value);
        emit EternisPost(postIndex, postData);
        emit EternisTipPost(postIndex, tipTo);
        postIndex++;
    }
}