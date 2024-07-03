# @penumbra-zone/zquery

## 3.0.0

### Major Changes

- af2d6b6: Update ZQuery to accept selectors; update minifront to take advantage of this feature

  ZQuery's `use[Name]()` hooks now accept an optional options object as their first argument, then pass any remaining arguments to the `fetch` function.

## 2.0.1

### Patch Changes

- 733d62a: Stop using loader functions for most routes; fix typings issue in ZQuery

## 2.0.0

### Major Changes

- 7ac610e: Beef up ZQuery's handling of streams; take advantage of it in minifront.

  BREAKING CHANGE: The `stream` property passed to `createZQuery()` should now return an object containing at least an `onValue` method. See the docs for the `stream` property for more info.

- f067fab: reconfigure all package builds

### Patch Changes

- f8b6193: Add tests

## 1.0.1

### Patch Changes

- 82068fc: Add missing scripts and fix tests

## 1.0.0

### Major Changes

- 6b06e04: Introduce ZQuery package and use throughout minifront
