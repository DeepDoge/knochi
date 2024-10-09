-   [ ] PostForm should have parts, not just text like on X or Facebook or Instagram. It should be more like a page builder.
-   [x] Instead of using tx.origin, Sender contract should give the sender address to the Indexer contract, and there should be permissions on the indexer contract that allows or disallows Sender contracts to index post in behalf of you.
-   [ ] On the left side of header we should have feed list similar to X lists, at the top there is the default home list for your home feed.
-   [ ] Users can have multiple feeds they can control, they have one main feed and they can also have different feeds to highlight different content.
-   [x] Indexers can also hold random metadata per user/account/wallet. Which can be used for avatars and more.
-   [ ] Also we take feedId with end padded wallet address, is inbox for that wallet, this feed can be used to mention and notify the a wallet owner. For example while replying someone if you dont add your reply to the index feed of the user you are replying to they dont get notified of your reply. This can be used for many purposes suchs as mentions and more.
-   [ ] Anyone can follow any feed, including someone else's inbox.
-   [ ] Also we should mix same feedId from different chains on the same feed on the client side.
-   [ ] Config page should be done.
-   [ ] Make currentConfig non promise, also broadcast changes between tabs and stuff.
-   [ ] remember wallet state, tbh for this and config i can just use local storage. makes more sense. why did i make a KV table anyway...

Let's do all these first then, look for new stuff.

After finishing everything, we can add support for different decenterlized protocols, and they can be mixed into feeds similar to how we mix different chains and networks on a single feed.
