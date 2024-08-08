# Why all of these have their own "module"?

Each of these needs a different TS environment:
- **app:** needs browser environment types such as DOM.
- **service:** needs webworker environment and DOM shouldn't exist in it.
- **contracts:** made out of scripts that builds contracts, so they need NodeJS environment.
- **shared:** contains shared utils between every environment which doesn't contain any specialized types like DOM, webworker, or NodeJS. So it doesn't have `window`, `fetch` event, `process`, and etc. Just basic JS types.

But most of the app exists in `app` directory.
