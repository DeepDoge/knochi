// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract PostDB {
    uint public postId; 
    // Mapping is for future NFTs or similar stuff, to check post author on-chain
    mapping (uint => address) public postIdToAuthorMap;

    event Post(uint postId, bytes postData);
    function post(bytes calldata postData) public {
        postIdToAuthorMap[postId] = msg.sender;
        emit Post(postId++, postData);
    }
}
