// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisPostDB.sol";

/* 
    Off-chain rules:
    - If you offer payment for a post that you didnt post, its being ignored and not showed. Even if the offer accepted on chain. So you would waste money.
*/

contract EternisOfferPostDB is IEternisPostDB {
    uint256 public index; // offer and post index counter

    struct Offer
    {
        address from;
        address to;
        address contractAddress; // contract address across all chains
        uint256 contractPostIndex; // contract post index   
        uint256 value;
    }

    
    // OfferIndex => Offer
    mapping(uint256 => Offer) public offers;

    event EtenisOffer(uint256 offerIndex, uint256 value);
    function newOffer(address to, address contractAddress, uint256 contractPostIndex) external payable {
        require(to != msg.sender, "Can't offer to yourself");
        uint256 offerIndex = index++;
        offers[offerIndex] = Offer(msg.sender, to, contractAddress, contractPostIndex, msg.value);
        emit EtenisOffer(offerIndex, msg.value);
    }

    event EternisOfferCancel(uint256 offerIndex);
    function cancelOffer(uint256 offerIndex) external {
        Offer memory offer = offers[offerIndex];
        require(offer.from == msg.sender, "Offer isn't from you");
        delete offers[offerIndex];
        emit EternisOfferCancel(offerIndex);
    }

    function acceptOffer(uint256 offerIndex) external {
        Offer memory offer = offers[offerIndex];
        require(offer.to == msg.sender, "Offer is not for you");

        delete offers[offerIndex];
        // Reposts the post, we decide if it was an offer on off-chain indexing.
        // Because offer contract is platform specific
        // if a platform doesn't index for sponsorships of this contract, they will see the post as a normal repost. 
        bytes memory bytesData = abi.encodePacked(bytes20(offer.contractAddress), offer.contractPostIndex);
        emit EternisPost(offerIndex, abi.encodePacked(hex"6563686f0a0000", bytes2(uint16(bytesData.length)), bytesData));
        payable(msg.sender).transfer(offer.value);
    }
    
}