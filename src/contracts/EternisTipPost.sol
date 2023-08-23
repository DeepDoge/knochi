// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisTransactionEmitter.sol";

contract EternisTipPost is IEternisTransactionEmitter {
    uint256 public postIndex;

    struct Tip
    {
        address to;
        uint256 value;
    }

    mapping(uint256 => Tip) public postIndexToTip;

    function post(bytes calldata postData, address payable tipTo) external payable {
        postIndexToTip[postIndex] = Tip(tipTo, msg.value);
        emit EternisTransaction(postIndex, postData);
        postIndex++;
        tipTo.transfer(msg.value);
    }
}
