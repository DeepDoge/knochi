**UPDATE:** Rewrite in progress... 🚧

Inspired by https://github.com/DeepDoge/dweb-forum

# Eternis

An unstoppable, public, permissionless platform with a multi-chain perma-database.
Allows users to post and interact across different blockchains while maintaining control over their data.
Indexed through various technologies and protocols, it offers a customizable and resilient experience built on blockchain and decentralized principles.

## How Eternis Works

Eternis uses a combination of existing technologies to achieve its functionality. The platform utilizes IPFS (InterPlanetary File System) to host front-end and content media. It also utilizes The Graph to index chains and smart contracts to enable on-chain logic. This architecture allows for a flexible and customizable platform that meets the needs of content creators and users.

## Key Features

-   **Ownerless Platform:** Eternis is designed to be ownerless from the ground up. This means that not even a single entity or platform has control over the content posted by users. Your content always remains under your control on the blockchain and can be accessed by any platform.

-   **Multichain Support with Combined Timeline:** Eternis supports multiple blockchains, allowing users to post their content on different chains. However, all the posts from all chains are combined under one unified timeline. This means that you have the freedom to choose any blockchain without being restricted to a single network.

-   **Customization and Flexibility:** Eternis utilizes smart contracts, which enable the creation and deployment of custom on-chain logic. This allows for the implementation of various features such as tipping, sponsored posts, and more. Platform developers have the freedom to customize and enhance the functionality of Eternis.

## How Eternis Differs from Other Platforms

-   **Mastodon/Fediverse:** While both Eternis and Mastodon are social media platforms, they differ in their architectures and priorities. Mastodon operates through instances that host and own your content. It uses a protocol to enable communication between Mastodon instances and other fediverse platforms. In contrast, Eternis stores your content on the blockchain, ensuring that no single platform owns or controls it. If one platform censors your content, other platforms can still display it, providing a more resilient and censorship-resistant environment.

-   **LBRY/Odysee:** LBRY/Odysee and Eternis are both decentralized content sharing platforms with very similar designs. However, there are some distinct differences between the two. LBRY/Odysee is primarily based on the LBRY blockchain, while Eternis is a multichain platform that can operate on multiple blockchains. Eternis provides greater customization and flexibility through its smart contract-based architecture, allowing for the implementation of additional features and functionalities. Moreover, Eternis utilizes a combination of existing solutions, such as IPFS and The Graph, to achieve its functionality and has the flexibility to adapt and change them in the future. This ensures the platform's adaptability and future-proofing.

## What do I mean by decentralized

I don't necessarily advocate for users hosting their own nodes. It's not a requirement for achieving decentralization. The key is providing a common protocol where users can easily switch between nodes, ensuring no single entity has a monopoly. The beauty lies in the simplicity of changing settings – a URL in the settings page, a short string – allowing users to maintain control without the need for hosting their own nodes.

I've started thinking about decentralization in terms of having a common protocol, common database, and a common CDN. If one node or gateway turns malicious, users can simply switch to another, and that's the beauty of it. No single node holds a monopoly over the blockchain; it's distributed.

Main point is the node doesn't own your content, it just indexes and host it through HTTP. There are no admins other than the protocol.
Yes, you can have your own node but you don't have to while having wide variety of public nodes/gateways/providers you can switch between. Just like miners can switch between pools.

The same principle applies to IPFS; no single gateway monopolizes content. You can switch to another gateway and still access the same content. WalletConnect follows a similar logic.

Enabling users to change nodes through a user-friendly settings page makes the app itself decentralized. The gateway you currently use might shut down, Infura could go bankrupt, or Cloudflare might censor content. However, by simply changing a setting – a URL in the settings page, a short string – you can continue using the same app.

You don't need to host your own node. The real decentralization lies in the ability to easily switch between nodes, providing users with control and flexibility.

Of course your own app being on IPFS is also a must.
As I always say, If you wanna build something that is TRULY Web3, you always have to ask yourself:

-   "Is this self sustaining? "
-   "Would it continue working without me?"
-   "Would it continue working without constant maintenance?"
-   "Would it continue working without constant funding?"

if the answer is "Yes", then it's decentralized.

Fediverse (Mastadon) is a decentralized communication protocol, but it's not a decentralized post database. So it's a decentralized network of centralized social media platforms that hosts and owns your posts, which can be censored. So, it's not decentralized.

In order to call your app "decentralized", all of it's aspects should be decentralized.

## cherry-ts

Made with [cherry-ts](https://github.com/DeepDoge/cherry-ts) UI building library.
