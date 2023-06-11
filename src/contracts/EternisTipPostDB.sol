// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisPostDB.sol";

contract EternisTipPostDB is IEternisPostDB {
    uint256 public postIndex;

    struct Tip
    {
        address to;
        uint256 value;
    }

    mapping(uint256 => Tip) public postIndexToTip;

    function post(bytes calldata postData, address payable tipTo) external payable {
        emit EternisPost(postIndex, postData);
        postIndexToTip[postIndex] = Tip(tipTo, msg.value);
        postIndex++;
        tipTo.transfer(msg.value);
    }
}
