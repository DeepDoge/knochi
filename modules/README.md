# Why all of these have their own "module"?

Each of these needs a different TS environment:

-   **app:** needs browser environment types such as DOM.
-   **service:** needs webworker environment and DOM shouldn't exist in it. And we shouldn't access and import anything in `service` diretly from `app` accidently.
-   **contracts:** made out of scripts that builds contracts, so they need NodeJS environment.
-   **shared:** contains shared utils between every environment which doesn't contain any specialized types like DOM, webworker, or NodeJS. So it doesn't have `window`, `fetch` event, `process`, and etc. Just basic JS types.

So if you check `tsconfig.json` in each of these, you will see that all of them are different.
