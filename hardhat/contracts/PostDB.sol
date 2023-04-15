// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract PostDB {
    uint public postId; 
    mapping (uint => address) public postIdToAuthorMap;
     // Mapping is for future NFTs or similar stuff, to check post author on-chain

    event Post(address authorId, uint postId, bytes postData);
    function post(bytes calldata postData) public {
        postIdToAuthorMap[postId] = msg.sender;
        emit Post(msg.sender, postId++, postData);
    }
}
