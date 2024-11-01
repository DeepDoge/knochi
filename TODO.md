# TODO

-   [ ] PostForm should have parts, not just text like on X or Facebook or Instagram. It should be more like a page builder.
-   [x] Instead of using tx.origin, Sender contract should give the sender address to the Indexer contract, and there should be permissions on the indexer contract that allows or disallows Sender contracts to index post in behalf of you.
-   [x] On the left side of header we should have feed list similar to X lists, at the top there is the default home list for your home feed.
-   [x] We should be able to add any feed we want to the list. So we should have a add to feed popover and button something.
-   [x] List/Group, Feed groups can be better if we also have a FeedGroupItem model, this way we can attach some metadata to feeds, like what kind of feed its. we can also do it by parsing feed id and giving meanings to it, but that wont work for things like topic since they will be hashed. And we cant parse from hash. Also it would make it more flexable.
-   [x] Users can have multiple feeds they can control, they have one main feed and they can also have different feeds to highlight different content.
-   [x] Indexers can also hold random metadata per user/account/wallet. Which can be used for avatars and more.
-   [ ] Also we take feedId with end padded wallet address, is inbox for that wallet, this feed can be used to mention and notify the a wallet owner. For example while replying someone if you dont add your reply to the index feed of the user you are replying to they dont get notified of your reply. This can be used for many purposes suchs as mentions and more.
-   [x] Anyone can follow any feed, including someone else's inbox.
-   [x] Also we should mix same feedId from different chains on the same feed on the client side.
-   [ ] Config page should be done.
-   [x] Make currentConfig non promise, also broadcast changes between tabs and stuff.
-   [ ] remember wallet state
-   [x] tbh for this and config i can just use local storage. makes more sense. why did i make a KV table anyway...
-   [ ] feeds on certain chains can be targeted by chainId, if chainId doesnt exists on the configs, there should be a button to open a modal that lets you add one.
-   [ ] endpoints
    -   [x] /{feedId}
    -   [x] /{account}
    -   [x] ?group={groupId}
    -   [ ] ?post={chainIdHex0xOmitted}-{indexerAddress0xOmitted}-{indexHex0xOmitted}
-   [ ] Offline real time video captions (https://github.com/msqr1/Vosklet)
-   [ ] Design profile page
-   [x] Design posts
-   [ ] Show combined feeds feed for one group

# Ideas

-   Comment on video time (tricky to index with feeds, and also a post can have multiple medias so thats also tricky), we should have reply to media, not just post. when we combine contract address and postId, we get a bytes32 feedid for the replies, so there is no other space left for anything else. but we can just hash stuff to get feedId which also works, so yeah. in this case we dont have to keep stuff small?
-   also if a post has multiple media we can treat each as a different post on the frontend, at least for videos. that way we can comment on the media itself because if a post has multiple medias and we have to comment on time for videos shit gets tricky. we dont want people accidently commenting without time on videos, which would be hard to find. gonna think about this a bit more. maybe we show a modal to view the video and that modal can have comments on the side.
-   hmm, once we enter the video mode, we can swipe up to skip non video content, and just watch videos like shorts maybe?
-   even though we stopped this on the contract level we should still ignore posts from other people one a profile feed. because indexers doesnt have to ignore those, and also later when we add other protocols such as ipfs pubsub, or linked ipfs array with ipns head or tail and etc for feeds we can have such logic anyway. so skip them on frontend also by now
-   i might add support for other social media protocols, but they have to be topic based, accounts are still evm based.
-   I should have support on video/movie/series/episodes/shorts, and music/audio
-   We should be able to continue scrolling from where we left of when page refreshed, this one is kinda tricky, by the nature of being multichain and contract. might require a really long url.
