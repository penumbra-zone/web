---
name: Deployment
about: Use this template when you're going to deploy a new release of the extension and web app.
title: Publish vX.X.X extension + web app
labels: deployment
---

- [ ] Manual testing to confirm extension works with main flows
  - [ ] Balances
  - [ ] Send
  - [ ] Swap
  - [ ] Staking
  - [ ] IBC
  - [ ] Tx details
  - [x] ~Do a full sync with with [assertRootValid()](https://github.com/penumbra-zone/web/blob/main/packages/query/src/block-processor.ts#L383-L395) enabled. Will throw if TCT roots are not correct.~ (Ignore for now.)
- [ ] Merge changlist PR or manually run `pnpm changeset version`. Will publish updated npm packages.
- [ ] Update [npm package version](https://github.com/penumbra-zone/web/blob/main/package.json#L3)
- [ ] Update [manifest version](https://github.com/penumbra-zone/web/blob/main/apps/extension/public/manifest.json#L4) based on the extension's newly updated [`package.json` version](https://github.com/penumbra-zone/web/blob/main/apps/extension/package.json) in the extension.
- [ ] Create repo release with `vX.X.X` tag. Triggers approval to run chrome extension publishing.
- [ ] Run `pnpm build` in the web repo's root. Then take minifront & node-status `dist` output and make PR against core repo to update node's frontends.
- [ ] Wait 1-3 days until new extension version is live on [chrome web store](https://chromewebstore.google.com/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe)
- [ ] Run `Deploy Static Site` [github action](https://github.com/penumbra-zone/web/actions/workflows/deploy-firebase-dapp.yml)
- [ ] Make `@channel` announcement in Discord #web-ext-feedback channel if there are any relevant features to announce.
