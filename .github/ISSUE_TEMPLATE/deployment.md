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
  - [ ] Test sync with [assertRootValid()](https://github.com/penumbra-zone/web/blob/992bc2d975ef55537dac95db4e29c49715bf740b/docs/debugging.md) enabled. Will throw if TCT roots are not correct. Only test the first few dozen blocks; if those succeed, there's no need to keep going.
- [ ] If there is already a changelist PR (like [this one](https://github.com/penumbra-zone/web/pull/799)), merge it. Otherwise, manually run `pnpm changeset` to bump packages as needed (would require work looking through PRs since last version) and run `pnpm changeset version` after. If this has resulted in a change to the `package.json` `version` in the extension, update the extension's `manifest.json` version to match. You'll have local changes that will require a PR to merge.
  - This step will publish updated npm packages.
- [ ] Update [manifest version](https://github.com/penumbra-zone/web/blob/main/apps/extension/public/manifest.json#L4) based on the extension's newly updated [`package.json` version](https://github.com/penumbra-zone/web/blob/main/apps/extension/package.json) in the extension.
- [ ] [Create repo release](https://github.com/penumbra-zone/web/releases/new) with `vX.X.X` tag. Triggers approval to run chrome extension publishing.
- [ ] Go into [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
  - Submit BETA version for approval + immediate publishing
  - Submit PROD version for approval (without publishing)
- [ ] In the repo root, run `sh ./scripts/build-for-deployment.sh`. It will create two .zip files. Use those files to open a PR against core repo to update [the node's frontends](https://github.com/penumbra-zone/penumbra/tree/main/assets).
- [ ] Wait 1-3 days until new extensions have been approved. Inform BETA testers to test it out. If all is well, publish PROD version which makes it is live on [chrome web store](https://chromewebstore.google.com/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe)
- [ ] Run `Deploy Static Site` [github action](https://github.com/penumbra-zone/web/actions/workflows/deploy-firebase-dapp.yml) on tag from the release
- [ ] Work with comms team for relevant discord announcements and social posts for new features we want to amplify
