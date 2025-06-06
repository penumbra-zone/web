# @penumbra-zone/types

## 34.2.1

### Patch Changes

- 82d034e: fix publish workflow
- Updated dependencies [82d034e]
  - @penumbra-zone/bech32m@17.0.1
  - @penumbra-zone/getters@27.0.1
  - @penumbra-zone/protobuf@10.1.1

## 34.2.0

### Minor Changes

- cee8150: don't specify auto-increment key

## 34.1.0

### Minor Changes

- ec85373: storage helper to save remote epoch

## 34.0.0

### Minor Changes

- dc1eb8b: tct frontier support for freshly generated wallets
- f9cd9dd: chunk genesis syncing

### Patch Changes

- Updated dependencies [dc1eb8b]
  - @penumbra-zone/protobuf@10.1.0
  - @penumbra-zone/bech32m@17.0.0
  - @penumbra-zone/getters@27.0.0

## 33.1.0

### Minor Changes

- 085e855: use asset id instead of metadata in liquidity tournament idb table

## 33.0.0

### Minor Changes

- 93f1d05: proto and storage changes to support querying tournament votes

### Patch Changes

- Updated dependencies [93f1d05]
  - @penumbra-zone/protobuf@10.0.0
  - @penumbra-zone/bech32m@16.0.0
  - @penumbra-zone/getters@26.0.0

## 32.2.1

### Patch Changes

- 405b5b1: Fix swap ActionViews not rendering values correctly
- Updated dependencies [405b5b1]
  - @penumbra-zone/getters@25.0.1

## 32.2.0

### Minor Changes

- ce4c43e: Add empty string case to round fn

## 32.1.0

### Minor Changes

- b0e0eef: Add exponentialNotation to round fn
- 85022e1: remove `getUnbondingStartHeight` export from assets regex module

### Patch Changes

- 5c45f2c: Fix `pnum` failing on `undefined` in denom exponent
- 3c48120: Fix Swap getters for ActionViews

## 32.0.0

### Minor Changes

- 15d768f: transaction summary support for transaction info rpc

### Patch Changes

- Updated dependencies [15d768f]
  - @penumbra-zone/protobuf@9.0.0
  - @penumbra-zone/bech32m@15.0.0
  - @penumbra-zone/getters@25.0.0

## 31.0.0

### Patch Changes

- Updated dependencies [d0cc2ee]
  - @penumbra-zone/getters@24.1.0

## 30.0.0

### Major Changes

- 49ae3ab: LQT integration in web packages

### Patch Changes

- Updated dependencies [49ae3ab]
  - @penumbra-zone/protobuf@8.0.0
  - @penumbra-zone/bech32m@14.0.0
  - @penumbra-zone/getters@24.0.0

## 29.1.0

### Minor Changes

- e51bc61: transaction table indexes by height and save txp and txv in indexdb

## 29.0.0

### Patch Changes

- Updated dependencies [68b8f36]
  - @penumbra-zone/protobuf@7.2.0
  - @penumbra-zone/bech32m@13.0.0
  - @penumbra-zone/getters@23.0.0

## 28.0.0

### Minor Changes

- 6869c52: extend alternative fees to LPs
- 29dd11a: - storage: add subaccount filter to `getOwnedPositionIds` method
  - protobuf: sync latest changes in penumbra protobufs
  - services: add subaccount filter to `ownedPositionIds` method in ViewService
  - types: update indexedDB schema

### Patch Changes

- Updated dependencies [29dd11a]
  - @penumbra-zone/protobuf@7.1.0
  - @penumbra-zone/bech32m@12.0.0
  - @penumbra-zone/getters@22.0.0

## 27.1.0

### Minor Changes

- ebc58d2: Fix pnum parsing ValueView

## 27.0.0

### Minor Changes

- 95d5fd9: support transparent addresses for usdc noble IBC withdrawals

### Patch Changes

- Updated dependencies [95d5fd9]
  - @penumbra-zone/protobuf@7.0.0
  - @penumbra-zone/bech32m@11.0.0
  - @penumbra-zone/getters@21.0.0

## 26.4.0

### Minor Changes

- d619836: Add toValueView() to pnum

## 26.3.0

### Minor Changes

- 712e7b1: Add pnum

## 26.2.1

### Patch Changes

- 838de8a: Round func updates: remove trailing zeros + exponent notation support

## 26.2.0

### Minor Changes

- 291bc7d: Adding shortify + round utilities

## 26.1.0

### Minor Changes

- b5d2922: send max feature

## 26.0.0

### Patch Changes

- Updated dependencies [3269282]
  - @penumbra-zone/protobuf@6.3.0
  - @penumbra-zone/bech32m@10.0.0
  - @penumbra-zone/getters@20.0.0

## 25.0.0

### Patch Changes

- Updated dependencies [e543db4]
  - @penumbra-zone/protobuf@6.2.0
  - @penumbra-zone/bech32m@9.0.0
  - @penumbra-zone/getters@19.0.0

## 24.0.0

### Minor Changes

- b6e32f8: Update ViewServerInterface

### Patch Changes

- Updated dependencies [b6e32f8]
- Updated dependencies [b6e32f8]
  - @penumbra-zone/protobuf@6.1.0
  - @penumbra-zone/bech32m@8.0.0
  - @penumbra-zone/getters@18.0.0

## 23.0.0

### Patch Changes

- Updated dependencies [3a5c074]
- Updated dependencies [3a5c074]
  - @penumbra-zone/getters@17.0.0

## 22.0.0

### Major Changes

- e01d5f8: fresh and existing wallets skip trial decryption

## 21.0.0

### Patch Changes

- Updated dependencies [f8730e9]
  - @penumbra-zone/getters@16.0.0

## 20.0.0

### Patch Changes

- Updated dependencies [49263c6]
  - @penumbra-zone/protobuf@6.0.0
  - @penumbra-zone/bech32m@7.0.0
  - @penumbra-zone/getters@15.0.0

## 19.0.0

### Minor Changes

- 10ef940: Updating to v0.80.0 bufbuild types

### Patch Changes

- Updated dependencies [10ef940]
  - @penumbra-zone/getters@14.0.0

## 18.2.0

### Minor Changes

- bd43d49: require complete GasPrices input to saveGasPrices
- 807648a: Support viewing fresh state of jailed validators

### Patch Changes

- Updated dependencies [bd43d49]
  - @penumbra-zone/getters@13.0.1

## 18.1.0

### Minor Changes

- f5bea48: fix source randomizer

## 18.0.0

### Minor Changes

- a9ffd2d: rework extractAltFee with fallback protections

### Patch Changes

- @penumbra-zone/getters@13.0.0

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
