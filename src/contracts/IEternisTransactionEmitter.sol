// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IEternisTransactionEmitter {
    event EternisTransaction(uint256 postIndex, bytes postData);
}