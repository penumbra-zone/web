# Deployment Workflows

### Prax Chrome Extension

Create a [github issue deployment issue](https://github.com/penumbra-zone/web/issues/new?template=deployment) to track deployment progress and steps.

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
