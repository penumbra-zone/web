# Deployment Workflows

### Prax Chrome Extension

Create a [github issue deployment template](https://github.com/penumbra-zone/web/issues/new?title=Publish%20vX.X.X%20extension%20%2B%20web%20app&body=-%20%5B%20%5D%20Manual%20testing%20to%20confirm%20extension%20works%20with%20main%20flows%0A%20%20-%20%5B%20%5D%20Balances%0A%20%20-%20%5B%20%5D%20Send%0A%20%20-%20%5B%20%5D%20Swap%0A%20%20-%20%5B%20%5D%20Staking%0A%20%20-%20%5B%20%5D%20IBC%0A%20%20-%20%5B%20%5D%20Tx%20details%0A-%20%5B%20%5D%20Update%20%5Bmanifest%20version%5D(https://github.com/penumbra-zone/web/blob/main/apps/extension/public/manifest.json%23L4)%20%0A-%20%5B%20%5D%20Update%20%5Bnpm%20package%20version%5D(https://github.com/penumbra-zone/web/blob/main/package.json%23L3)%0A-%20%5B%20%5D%20Create%20repo%20release%20with%20%60vX.X.X%60%20tag.%20Triggers%20approval%20to%20run%20chrome%20extension%20publishing.%0A-%20%5B%20%5D%20Wait%201-3%20days%20until%20new%20extension%20version%20is%20live%20on%20%5Bchrome%20web%20store%5D(https://chromewebstore.google.com/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe)%0A-%20%5B%20%5D%20Run%20%60Deploy%20Static%20Site%60%20%5Bgithub%20action%5D(https://github.com/penumbra-zone/web/actions/workflows/deploy-firebase-dapp.yml)%0A-%20%5B%20%5D%20Make%20%60%40channel%60%20announcement%20to%20Discord%20about%20new%20swap%20feature) to track deployment progress and steps.

Upon a new [git tag](https://github.com/penumbra-zone/web/releases/tag/v4.2.0) being pushed to the repo,
a [workflow](../.github/workflows/extension-publish.yml) is kicked off. It then requests permission to
continue from [github group](https://github.com/orgs/penumbra-zone/teams/penumbra-labs) and, after approval,
bundles the extension into a .zip which gets put in the Chrome Webstore review queue. It typically takes
1-3 days to go live. The publication status can be monitored in the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/aabc0949-93db-4e77-ad9f-e6ca1d132501?hl=en).

### Web app

Manually run [Deploy Firebase Dapp](https://github.com/penumbra-zone/web/actions/workflows/deploy-firebase-dapp.yml) github action on main branch.

### NPM Packages

The packages in this repo are published using [changesets](https://github.com/changesets/changesets).

As changes are made in the repo, devs are encouraged to generate a changeset via `pnpm changeset`. These markdown files are committed along with their PR. They look like this:

```markdown
---
'@penumbra-zone/query': major
'@penumbra-zone/client': minor
---

A very helpful description of the changes
```

When we are ready to push these changes to NPM, run the [Packages Release](../.github/workflows/packages-release.yml) workflow.
If there are changesets, it will create a PR versioning the packages appropriately and adding changelogs. 
If there are no changesets, it will attempt to publish all packages with newer versions (not marked as private).

### Node status page

Build the latest node status page in this repo via `pnpm build`. Take the resulting `dist` output,
zip the folder, and create a PR in [penumbra core](https://github.com/penumbra-zone/penumbra/tree/main/assets) updating `node-status.zip`.
When a new chain version is pushed, this will be deployed with it.
