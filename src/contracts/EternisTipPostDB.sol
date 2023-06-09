// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisPostDB.sol";

contract EternisTipPostDB is IEternisPostDB {
    uint256 public postIndex;

    mappings(uint256 => address) postIndexToTipAddress;
    mappings(uint256 => uint256) postIndexToTipValue;

    function post(bytes calldata postData, address payable tipTo) external payable {
        emit EternisPost(postIndex, postData);
        postIndexToTipAddress[postIndex] = tipTo;
        postIndexToTipValue[postIndex] = msg.value;
        postIndex++;
        tipTo.transfer(msg.value);
    }
}
