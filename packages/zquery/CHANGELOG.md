# @penumbra-zone/zquery

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
