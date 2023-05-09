// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisPostDB.sol";

abstract contract IEternisTipPostDB is IEternisPostDB {
    event EternisTip(uint256 postIndex, address tipTo);
}