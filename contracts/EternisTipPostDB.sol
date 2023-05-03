// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisTipPostDB.sol";


contract EternisTipPostDB is IEternisTipPostDB {
    uint256 public postIndex;

    function post(bytes calldata postData, address payable tipTo) external payable {
        tipTo.transfer(msg.value);
        emit EternisPost(postIndex, postData);
        emit EternisTip(postIndex, tipTo);
        postIndex++;
    }
}