# @penumbra-zone/types

## 17.0.1

### Patch Changes

- 3477bef: bugfix: injecting globalThis.**DEV** correctly on prod builds

## 17.0.0

### Patch Changes

- Updated dependencies [86c1bbe]
  - @penumbra-zone/getters@12.1.0

## 16.1.0

### Minor Changes

- 0233722: added proxying timestampByHeight

## 16.0.0

### Patch Changes

- @penumbra-zone/getters@12.0.0

## 15.1.1

### Patch Changes

- 3aaead1: Move the "default" option in package.json exports field to the last

## 15.1.0

### Minor Changes

- 877fb1f: use epochDuration as PRICE_RELEVANCE_THRESHOLD for delegation assets

## 15.0.0

### Minor Changes

- fa798d9: Bufbuild + registry dep update

### Patch Changes

- Updated dependencies [fa798d9]
  - @penumbra-zone/getters@11.0.0

## 14.0.0

### Major Changes

- 28a48d7: Fixes for multi-asset fees

## 13.1.0

### Minor Changes

- 43ccd96: Modify GasPrices storage to support multi-asset fees

## 13.0.0

### Patch Changes

- 3708e2c: include peer deps as dev deps
- Updated dependencies [3708e2c]
- Updated dependencies [af2d6b6]
  - @penumbra-zone/bech32m@6.1.1
  - @penumbra-zone/getters@10.1.0

## 12.0.0

### Minor Changes

- Synchronize published @buf deps

### Patch Changes

- Updated dependencies
  - @penumbra-zone/getters@10.0.0

## 11.0.0

### Major Changes

- bump registry

## 10.0.0

### Minor Changes

- 4161587: Update to latest bufbuild deps (v0.77.4)

### Patch Changes

- Updated dependencies [4161587]
  - @penumbra-zone/getters@9.0.0

## 9.0.0

### Minor Changes

- 9b3f561: properly build esm relative paths

### Patch Changes

- Updated dependencies [9b3f561]
  - @penumbra-zone/bech32m@6.1.0
  - @penumbra-zone/getters@8.0.0

## 8.0.0

### Major Changes

- f067fab: reconfigure all package builds

### Patch Changes

- Updated dependencies [f067fab]
  - @penumbra-zone/bech32m@6.0.0
  - @penumbra-zone/getters@7.0.0

## 7.1.1

### Patch Changes

- Updated dependencies [a75256f]
- Updated dependencies [468ecc7]
- Updated dependencies [a75256f]
  - @penumbra-zone/bech32m@5.1.0
  - @penumbra-zone/getters@6.2.0

## 7.1.0

### Minor Changes

- ab9d743: decouple service/rpc init
- 282eabf: Click wallet for max amount

### Patch Changes

- c8e8d15: Bug fix in getFormattedAmtFromValueView: support known assets without metadata
- Updated dependencies [6b06e04]
  - @penumbra-zone/getters@6.1.0

## 7.0.1

### Patch Changes

- Updated dependencies [8fe4de6]
  - @penumbra-zone/bech32m@5.0.0
  - @penumbra-zone/getters@6.0.0

## 7.0.0

### Major Changes

- bb5f621: formatAmount() takes new args

### Patch Changes

- Updated dependencies [8b121ec]
  - @penumbra-zone/bech32m@4.0.0
  - @penumbra-zone/getters@5.0.0

## 6.0.0

### Major Changes

- 029eebb: use service definitions from protobuf collection package

### Minor Changes

- 3ea1e6c: update buf types dependencies

### Patch Changes

- Updated dependencies [120b654]
- Updated dependencies [3ea1e6c]
  - @penumbra-zone/getters@4.1.0
  - @penumbra-zone/bech32m@3.2.0

## 5.0.0

### Major Changes

- 8ccaf30: externalize dependencies

### Patch Changes

- 146b48d: Support GDAs
- e35c6f7: Deps bumped to latest
- Updated dependencies [146b48d]
- Updated dependencies [8ccaf30]
- Updated dependencies [8ccaf30]
- Updated dependencies [e35c6f7]
- Updated dependencies [cf63b30]
- Updated dependencies [8ccaf30]
  - @penumbra-zone/getters@4.0.0
  - @penumbra-zone/bech32m@3.1.1

## 4.1.0

### Minor Changes

- v8.0.0 versioning and manifest

### Patch Changes

- Updated dependencies
  - @penumbra-zone/bech32m@3.1.0
  - @penumbra-zone/getters@3.0.2

## 4.0.1

### Patch Changes

- Updated dependencies [8410d2f]
  - @penumbra-zone/bech32m@3.0.1
  - @penumbra-zone/getters@3.0.1

## 4.0.0

### Major Changes

- 6fb898a: initial release of `@penumbra-zone/protobuf` package containing `typeRegistry`. same removed from `@penumbra-zone/types`

## 3.0.0

### Major Changes

- 3148375: remove `/src/` path segment from exports

### Patch Changes

- Updated dependencies [3148375]
- Updated dependencies [fdd4303]
  - @penumbra-zone/constants@4.0.0
  - @penumbra-zone/getters@3.0.0
  - @penumbra-zone/bech32m@3.0.0

## 2.0.1

### Patch Changes

- Updated dependencies [862283c]
  - @penumbra-zone/constants@3.0.0
  - @penumbra-zone/getters@2.0.1

## 2.0.0

### Major Changes

- 929d278: barrel imports to facilitate better tree shaking

### Patch Changes

- Updated dependencies [8933117]
- Updated dependencies [929d278]
  - @penumbra-zone/constants@2.0.0
  - @penumbra-zone/getters@2.0.0
  - @penumbra-zone/bech32@2.0.0

## 1.1.0

### Minor Changes

- Initial changest. Git tag v5.0.0 updates.

### Patch Changes

- Updated dependencies
  - @penumbra-zone/constants@1.1.0
  - @penumbra-zone/getters@1.1.0
