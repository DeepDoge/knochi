**UPDATE:** Rewrite in progress... 🚧 <br>
Uhh, so well, I need to make this a nostr first app now.<br>
But yeah I don't have time, and there are other projects that i wanna do more than this first.

# Knochi

An unstoppable, adminless, permissionless, and ungoverned multi-chain platform.

Also, decentralized social media protocol aggregator social media app.

So multi-chain, multi-protocol, feed based social media aggregator.

## Future

Plan for support:

-   [ ] EVM blockchain feeds (on bitcoin second layers and other chains)
-   [ ] IPFS based feeds (using pubsub and ipns)
-   [ ] Nostr based feeds (nostr protocol)

Right now we use evm wallets as accounts. But it would be better if we supported many formats.
We can generate EVM privatekey from nostr signature, and other way around.
So it's posibble to support multiple.

Profile information is kinda tricky but i have a few ideas.

Goal here is maximizing decenterlization, and even changing what a social media means in order to make it decenterlized.
Familiarity can go to trash if its making things less decenterlized.

Each protocol has their quirks so we have to the app nice with adaptors.
We only include feed based protocols, where you have a feed/topic, and you post there. this includes your profile and notifiactions.
But adaptors can fake these anyway. So it can actually work anywhere.
IPFS is a not social protocol, so its not a worry for me. I can use it anyway i want.
But nostr is more of a social protocol and various things has various meanings already.
So I have to think about it, right now im focusing on EVM blockchain support.
And its not made to be multi protocol, and its made to be multichain, so i think i dont have to change much in order to make adaptors work with multiple protocols.
So for now im not focusing on multi protocol aspect, but its certainly a plan.
I don't want users to go to a "decenterlized" webapp but then connect to bunch of centerlized services that they didnt list on their settings.
I wanna compile the whole app into a single index.html, file that i can publish on ipfs.
And users can even double click on html file and they are in a social media, no servers, nothing, just a single html file webapp.

## Why am i doing this?

I'm not satisfied with existing solutions...

-   "Decentralized" platform can ban you.
-   "Decentralized" platform asks for email.
-   "Decentralized" platform asks for kyc.
-   "Decentralized" platform has their own servers that you connect to.
-   "Decentralized" platform is profitable and makes money from your content and is a bussiness not a protocol.
-   "Decentralized" platform is hard to participate in as a node.
