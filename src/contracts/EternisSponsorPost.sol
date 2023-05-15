// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IEternisPostDB.sol";

/* 
    Off-chain rules:
    - If you offer payment for a post that you didnt post, its being ignored and not showed. Even if the offer accepted on chain.
    - If we make an offer protocol, Offer event, we can also check if the accepted offer is really offered, so it doesnt have to be connected to one contract
    - - This means, people can act like they accepted the offer off-chain, without really accepting it and taking the money, but why would they do that so i think it works
*/

contract EternisSponsorPostDB is IEternisPostDB {
    uint256 public index; // also used as postIndex

    struct Offer
    {
        address to;
        address contractAddress; // contract address across all chains
        uint256 postIndex; // contract post index   
        uint256 value;
    }
    
    // OfferIndex => Offer
    mapping(uint256 => Offer) public offers;

    function acceptOffer(uint256 offerIndex) external {
        Offer memory offer = offers[offerIndex];
        require(offer.to == msg.sender, "Offer is not for you.");

        payable(msg.sender).transfer(offer.value);
        delete offers[offerIndex];
        // TODO: data should be empty, 0, because we are already gonna have an index for the offers and post index already equal to offer index
        // or here we can just say this is a simple repost/echo without saying its a sponsor post and if it matches any offer data we also attact it to it.
        // because any contract can lie to offchain, since we dont know what is happening in the contract, and having an offer protocol is not really posibble off-chain while keeping it distrbuted
        // so this will be a simple respost, and if we can also detect its a sponsored repost we also take that into account in the ui and query etc
        // eternis the platform owns the eternis ens name so front-end, and owns the graph indexer, thats all. 
        // so even if another indexer doesnt take eternis sponsered posts in the account they see these posts as normal reposts
        // 
        // Yeah something like that, I sleep now, gonna do that tommorow or later
        bytes memory bytesData = abi.encodePacked(bytes20(offer.contractAddress), offer.postIndex);
        emit EternisPost(offerIndex, abi.encodePacked(hex"73706f6e736f720a0000", bytes2(uint16(bytesData.length)), bytesData));
    }
    
}