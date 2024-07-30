# @penumbra-zone/wasm

## 20.2.0

### Minor Changes

- 318690e: Properly derive DelegatorVoteView from perspective

## 20.1.0

### Minor Changes

- d6ce325: Support customizing symbol for vote receipt tokens

### Patch Changes

- 3477bef: bugfix: injecting globalThis.**DEV** correctly on prod builds
- Updated dependencies [3477bef]
  - @penumbra-zone/types@17.0.1

## 20.0.0

### Minor Changes

- 4e30796: Witness delegator vote plans

### Patch Changes

- @penumbra-zone/types@17.0.0

## 19.0.0

### Patch Changes

- Updated dependencies [0233722]
  - @penumbra-zone/types@16.1.0

## 18.0.0

### Patch Changes

- Updated dependencies [22bf02c]
  - @penumbra-zone/protobuf@5.5.0
  - @penumbra-zone/types@16.0.0

## 17.0.2

### Patch Changes

- Updated dependencies [3aaead1]
  - @penumbra-zone/types@15.1.1

## 17.0.1

### Patch Changes

- 1a57749: Bug fix with get_all_notes not respecting None asset id + delegator voting tests

## 17.0.0

### Minor Changes

- 83151cb: Use the generated metadata for delegation tokens
- 1011b3b: Add delegator voting support
- 5641af2: Internally use dependency injection for storage for easier testing

### Patch Changes

- cbc2419: Stop truncating metadata symbols programatically
- Updated dependencies [877fb1f]
  - @penumbra-zone/types@15.1.0

## 16.0.0

### Minor Changes

- fa798d9: Update deps to v0.79.0
- fa798d9: Bufbuild + registry dep update

### Patch Changes

- Updated dependencies [fa798d9]
  - @penumbra-zone/protobuf@5.4.0
  - @penumbra-zone/types@15.0.0

## 15.0.0

### Minor Changes

- 28a48d7: Send max support

### Patch Changes

- Updated dependencies [28a48d7]
  - @penumbra-zone/types@14.0.0

## 14.0.0

### Minor Changes

- 43ccd96: Modify GasPrices storage to support multi-asset fees

### Patch Changes

- Updated dependencies [43ccd96]
  - @penumbra-zone/types@13.1.0

## 13.0.0

### Patch Changes

- 3708e2c: include peer deps as dev deps
- 2f1c39f: Alt token fee extraction refactor + tests
- Updated dependencies [e9e1320]
- Updated dependencies [3708e2c]
  - @penumbra-zone/protobuf@5.3.1
  - @penumbra-zone/bech32m@6.1.1
  - @penumbra-zone/types@13.0.0

## 12.0.0

### Minor Changes

- Synchronize published @buf deps

### Patch Changes

- Updated dependencies
  - @penumbra-zone/protobuf@5.3.0
  - @penumbra-zone/types@12.0.0

## 11.0.0

### Patch Changes

- Updated dependencies
  - @penumbra-zone/types@11.0.0

## 10.0.0

### Minor Changes

- 4161587: Update to latest bufbuild deps (v0.77.4)
- e207faa: finalize ceremony proving keys and update crate deps (v0.78.0)

### Patch Changes

- Updated dependencies [4161587]
  - @penumbra-zone/protobuf@5.2.0
  - @penumbra-zone/types@10.0.0

## 9.0.0

### Minor Changes

- 9b3f561: properly build esm relative paths

### Patch Changes

- Updated dependencies [9b3f561]
  - @penumbra-zone/protobuf@5.1.0
  - @penumbra-zone/bech32m@6.1.0
  - @penumbra-zone/types@9.0.0

## 8.0.0

### Major Changes

- f067fab: reconfigure all package builds

### Patch Changes

- Updated dependencies [f067fab]
  - @penumbra-zone/protobuf@5.0.0
  - @penumbra-zone/bech32m@6.0.0
  - @penumbra-zone/types@8.0.0

## 7.1.1

### Patch Changes

- Updated dependencies [a75256f]
  - @penumbra-zone/protobuf@4.2.0
  - @penumbra-zone/types@7.1.1

## 7.1.0

### Minor Changes

- 81b9536: add ibc types to registry, address wasm ser/de of protobuf.Any types

### Patch Changes

- 14ba562: Update transaction_perspective_and_view return type
- Updated dependencies [ab9d743]
- Updated dependencies [282eabf]
- Updated dependencies [81b9536]
- Updated dependencies [c8e8d15]
  - @penumbra-zone/types@7.1.0
  - @penumbra-zone/protobuf@4.1.0

## 7.0.0

### Major Changes

- 8fe4de6: correct ordering of default export

### Patch Changes

- @penumbra-zone/types@7.0.1

## 6.0.0

### Major Changes

- 8b121ec: change package exports to use 'default' field

### Patch Changes

- Updated dependencies [bb5f621]
  - @penumbra-zone/types@7.0.0

## 5.1.0

### Minor Changes

- 3ea1e6c: update buf types dependencies

### Patch Changes

- e86448e: include transaction id when generating perspective
- Updated dependencies [029eebb]
- Updated dependencies [3ea1e6c]
  - @penumbra-zone/types@6.0.0

## 5.0.1

## 5.0.0

### Major Changes

- 65677c1: publish javascript instead of typescript

### Minor Changes

- e4c9fce: Add features to handle auction withdrawals

### Patch Changes

- 8ccaf30: readme update recommending bsr
- e35c6f7: Deps bumped to latest
- 99feb9d: add base denom string to binary AssetId conversion utility
- Updated dependencies [146b48d]
- Updated dependencies [e35c6f7]
- Updated dependencies [8ccaf30]
  - @penumbra-zone/types@5.0.0

## 4.0.4

### Patch Changes

- v8.0.0 versioning and manifest
- Updated dependencies
  - @penumbra-zone/types@4.1.0

## 4.0.3

### Patch Changes

- @penumbra-zone/types@4.0.1

## 4.0.2

### Patch Changes

- Updated dependencies [6fb898a]
  - @penumbra-zone/types@4.0.0

## 4.0.1

### Patch Changes

- Updated dependencies [3148375]
  - @penumbra-zone/types@3.0.0

## 4.0.0

### Major Changes

- 78ab976: configure for publish

### Patch Changes

- @penumbra-zone/types@2.0.1

## 3.0.0

### Major Changes

- 66c2407: v6.2.0 release

## 2.0.0

### Major Changes

- 929d278: barrel imports to facilitate better tree shaking

### Minor Changes

- 8933117: Account for changes to core

### Patch Changes

- Updated dependencies [929d278]
  - @penumbra-zone/types@2.0.0

## 1.0.2

### Patch Changes

- Updated dependencies
  - @penumbra-zone/types@1.1.0
