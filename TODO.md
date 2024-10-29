-   [ ] PostForm should have parts, not just text like on X or Facebook or Instagram. It should be more like a page builder.
-   [x] Instead of using tx.origin, Sender contract should give the sender address to the Indexer contract, and there should be permissions on the indexer contract that allows or disallows Sender contracts to index post in behalf of you.
-   [x] On the left side of header we should have feed list similar to X lists, at the top there is the default home list for your home feed.
-   [ ] We should be able to add any feed we want to the list. So we should have a add to feed popover and button something.
-   [ ] List/Group, Feed groups can be better if we also have a FeedGroupItem model, this way we can attach some metadata to feeds, like what kind of feed its. we can also do it by parsing feed id and giving meanings to it, but that wont work for things like topic since they will be hashed. And we cant parse from hash. Also it would make it more flexable.
-   [ ] Users can have multiple feeds they can control, they have one main feed and they can also have different feeds to highlight different content.
-   [x] Indexers can also hold random metadata per user/account/wallet. Which can be used for avatars and more.
-   [ ] Also we take feedId with end padded wallet address, is inbox for that wallet, this feed can be used to mention and notify the a wallet owner. For example while replying someone if you dont add your reply to the index feed of the user you are replying to they dont get notified of your reply. This can be used for many purposes suchs as mentions and more.
-   [ ] Anyone can follow any feed, including someone else's inbox.
-   [x] Also we should mix same feedId from different chains on the same feed on the client side.
-   [ ] Config page should be done.
-   [x] Make currentConfig non promise, also broadcast changes between tabs and stuff.
-   [ ] remember wallet state
-   [x] tbh for this and config i can just use local storage. makes more sense. why did i make a KV table anyway...
-   [ ] We should be able to continue scrolling from where we left of when page refreshed, this one is kinda tricky, by the nature of being multichain and contract. might require a really long url. in that case i might rethink the whole contracts
-   [ ] feeds on certain chains can be targeted by chainId, if chainId doesnt exists on the configs, there should be a button to open a modal that lets you add one.
-   [ ] endpoints
    -   [ ] /{feedId}
    -   [ ] /{account}
    -   [ ] ?group={groupId}
    -   [ ] ?post={chainIdHex0xOmitted}-{indexerAddress0xOmitted}-{indexHex0xOmitted}

Let's do all these first then, look for new stuff.

After finishing everything, we can add support for different decenterlized protocols, and they can be mixed into feeds similar to how we mix different chains and networks on a single feed.
