# Development

This is a monolithic repository of Penumbra web code, a monorepo. Several
packages and multiple apps are published from this repository, to simplify work
and make broad cross-package changes and upgrades more feasible.

## Tools

- **pnpm**: pnpm's workspace feature is the foundation of the monorepo
- **turborepo**: a monorepo scripting tool
  - parallelize script execution
  - manage execution dependency
  - cache outputs to accelerate execution
- **syncpack**: a monorepo dependency manager
  - synchronize package dependencies
  - validate dependency version ranges with configurable rules
  - format and lint package json
- **changeset**: a monorepo version manager
  - increment semver in a topological way
  - progressively compile release notes as PRs merge
- **vite** and **vitest**:
  - vitest is a workspace-aware test utility
  - testing and bundling can use same config
  - vite bundles apps for deployment
  - vite lib mode also bundles some packages for publish
- **eslint**: an unpublished package centralizes lint configuration, applied to all packages
- **tsconfig**: an unpublished package centralizes typescript configuration, extended by each package

## Getting started

```sh
git clone https://github.com/penumbra-zone/web
cd web
pnpm i
pnpm dev
```

You now have a local copy of Minifront available at
[`https://localhost:5173`](https://localhost:5173) and a locally built Prax
available at `apps/extension/dist/`, ready to be loaded into your testing
browser.

Minifront will hot-reload. If you're working on the web extension, Chrome supports
hot-reloading extension pages, but cannot hot-reload the extension worker
scripts.

#### Loading extension into Chrome

1. Go to the Extensions page [`chrome://extensions`](chrome://extensions)
2. Enable _Developer Mode_ by clicking the toggle switch at the top right
3. Click the button _Load unpacked extension_ at the top and locate your cloned
   repository to select the extension's build output directory
   [`apps/extension/dist`](../apps/extension/dist).
4. Activate the extension to enter onboarding.
   - Pin your extension to the toolbar for quick access.
   - You may set a blank password.

### Handy scripts

These may be executed directly in an app or package directory, in which case
they only execute that package's script, or in the top level of the repo, in
which case they use turbo or the monorepo configuration.

- `pnpm clean`: remove build outputs.
- `pnpm compile`: compile rust into wasm.
- `pnpm build`: transform and bundle all packages and apps.
- `pnpm dev`: build all, serve local apps. watch and rebuild continuously.
- `pnpm test`: run vitest only. cargo tests are omitted.
- `pnpm test:rust`: run cargo tests only.
- `pnpm format`, `pnpm lint`
- `pnpm all-check`: check all!

## Dependency upgrades

You may add a new dependency or change a dependency version in the course of
your work. If you do so, you may see `syncpack` complain.

```
$ pnpm syncpack list-mismatches
Versions
= Use workspace protocol for local packages ====================================
    86 ✓ already valid
= Control @buf registry packages from root =====================================
    55 ✓ already valid
= Default Version Group ========================================================
✘ @tanstack/react-query ^5.28.9 → ^5.29.2 apps/extension/package.json > dependencies [HighestSemverMismatch]
✘ @testing-library/react ^14.2.2 → ^14.3.1 packages/ui/package.json > devDependencies [HighestSemverMismatch]
✘ @types/react ^18.2.72 → ^18.2.79 apps/extension/package.json > devDependencies [HighestSemverMismatch]
✘ @types/react ^18.2.72 → ^18.2.79 apps/node-status/package.json > devDependencies [HighestSemverMismatch]
✘ @types/react ^18.2.72 → ^18.2.79 packages/ui/package.json > devDependencies [HighestSemverMismatch]
✘ @types/react-dom ^18.2.22 → ^18.2.25 apps/extension/package.json > devDependencies [HighestSemverMismatch]
✘ @types/react-dom ^18.2.22 → ^18.2.25 apps/node-status/package.json > devDependencies [HighestSemverMismatch]
✘ @types/react-dom ^18.2.22 → ^18.2.25 packages/ui/package.json > devDependencies [HighestSemverMismatch]
   210 ✓ already valid
     8 ✓ can be auto-fixed
```

Most failures here can be resolved by running `pnpm syncpack fix-mismatches`.

```sh
$ pnpm syncpack fix-mismatches # propagate versions
$ pnpm i # use new versions and update lockfile
```

You should always run install again after fixing, because syncpack will not run
install for you.

### `@buf` registry

Syncpack is configured to prefer `@buf` registry versions specified at the root
package of the monorepo. So if you need new message types, you must update at
the root and propagate from there.

These packages also have tight relationships with `@bufbuild` and `@connectrpc`
packages, so it's usually best to update these together.

```sh
$ pnpm update --latest "@buf/*" "@bufbuild/*" "@connectrpc/*" # update root buf packages
$ pnpm syncpack fix-mismatches # propagate versions
$ pnpm i # use new versions and update lockfile
```

### Identifying sources of conflict

If you have conflicting dependencies, you can use `pnpm why` to inspect the
dependency tree.

## Documenting changes

Nearing merge of your new feature or bugfix, you should use `changeset` to write
documentation for the release notes.

```
$ pnpm changeset
> penumbra-web@changeset

🦋  Which packages would you like to include?
◯ changed packages
  ◯ @penumbra-zone/transport-chrome
  ◯ @penumbra-zone/transport-dom
  ◯ @penumbra-zone/services
  ◯ minifront
```

Changeset will show you a list of packages your branch has changed. Select the
packages for which you will write notes, and you will be prompted through the
process. Commit the notes to your branch and they'll be collated together with
other change notes when you merge, and finally published by the release
workflow.
