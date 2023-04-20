# How to

Update the `subgraph.yaml` and `abis` by hand if you wanna change contracts and stuff.

Use `npx graph auth {token}` to auth (you don't have to `cd` in `graph/`).

Then `npm run deploy` that simple.

Indexer code is at `src/post-db.ts`, it's an AssemblyScript, not TypeScript.
