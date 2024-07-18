# Deployment Workflows

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

When we are ready to push these changes to NPM, run the [Packages Release](../../../../../../.github/workflows/packages-release.yml) workflow.
If there are changesets, it will create a PR versioning the packages appropriately and adding changelogs.
If there are no changesets, it will attempt to publish all packages with newer versions (not marked as private).

### Node status page

Build the latest node status page in this repo via `pnpm build`. Take the resulting `dist` output,
zip the folder, and create a PR in [penumbra core](https://github.com/penumbra-zone/penumbra/tree/main/assets) updating `node-status.zip`.
When a new chain version is pushed, this will be deployed with it.
