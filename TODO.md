-   [ ] I'm not gonna worry about it atm, but using `tx.origin` is kinda bad, and might cause spam on your profile. So we actually gotta sign messages.

# Thinking

-   Right now, on the front end we might decide to do different things based on `msg.sender` so if the `msg.sender` is a unique kind of contract for example a tipping contract. We might also ask the contract for tipping information, like how much tip sent to who?. If front-end doesnt know the sender we treat it as a normal post. So the question now is should we use `msg.sender` which is cheap and easily understandable or makes some different signnature based thing? Well I think right it's good. So yeah I thinking using `msg.sender` is the best approach here. Not just easier or cheaper but also better less complex etc.

-   But we shouldn't use `tx.origin` because some contracts might decide to spam on our behalf which would be bad. We should have signature. But we shouldn't store the signature on the SSTORE that would be expensive. Instead, we should just verify it on the indexer and store the signer address only. After all all trust is on the indexer contract. Usually only one indexer contract should be enough per chain, and its not something dynamic like proxies. It can only be changed from the settings.

-   Knochi in the future can also support other decenterlized social media protocols, but real decenterlized ones. Not the ones that are called "decenterlized" but requires a whole brand and server to run. And that server stores stuff centerally.

# Reminder to self

Ok so im gonna change PostForm, it should be made out of parts. if same parts next to each other
they can combine based on their logic, for example multiple pictures can create gallery look
but everything should be a part.
even text. so when creating a new post you select to add a part.
