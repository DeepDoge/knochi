// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract PostDB {
    event Post(bytes postData);
    function post(bytes calldata postData) external {
        emit Post(postData);
    }
}
