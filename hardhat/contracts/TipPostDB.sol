// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract TipPostDB {
    event Post(bytes postData, address tipTo);
    function post(bytes calldata postData, address payable tipTo) external payable {
        tipTo.transfer(msg.value);
        emit Post(postData, tipTo);
    }
}
