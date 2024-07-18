# Dependency upgrades

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

## `@buf` registry

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

## Identifying sources of conflict

If you have conflicting dependencies, you can use `pnpm why` to inspect the
dependency tree.
