# @penumbra-zone/storage

## 14.0.0

### Major Changes

- 877fb1f: use epochDuration as PRICE_RELEVANCE_THRESHOLD for delegation assets

### Minor Changes

- cbc2419: Storage: bump IDB version. UI: fix Dialog rendering on mobile screens. Minifront: fix metadata symbol truncation.
- 3b7a289: Utilize v10 remote registry methods

### Patch Changes

- Updated dependencies [83151cb]
- Updated dependencies [cbc2419]
- Updated dependencies [877fb1f]
- Updated dependencies [1011b3b]
- Updated dependencies [5641af2]
  - @penumbra-zone/wasm@17.0.0
  - @penumbra-zone/types@15.1.0

## 13.0.0

### Minor Changes

- fa798d9: Bufbuild + registry dep update

### Patch Changes

- Updated dependencies [fa798d9]
- Updated dependencies [fa798d9]
  - @penumbra-zone/wasm@16.0.0
  - @penumbra-zone/getters@11.0.0
  - @penumbra-zone/types@15.0.0

## 12.0.0

### Major Changes

- 28a48d7: Fixes for multi-asset fees

### Patch Changes

- Updated dependencies [28a48d7]
- Updated dependencies [28a48d7]
  - @penumbra-zone/wasm@15.0.0
  - @penumbra-zone/types@14.0.0

## 11.0.0

### Major Changes

- 43ccd96: Modify GasPrices storage to support multi-asset fees

### Minor Changes

- 8e68481: Update to v9.3.0 registry

### Patch Changes

- Updated dependencies [43ccd96]
  - @penumbra-zone/types@13.1.0
  - @penumbra-zone/wasm@14.0.0

## 10.0.0

### Patch Changes

- 3708e2c: include peer deps as dev deps
- Updated dependencies [3708e2c]
- Updated dependencies [af2d6b6]
- Updated dependencies [2f1c39f]
  - @penumbra-zone/bech32m@6.1.1
  - @penumbra-zone/getters@10.1.0
  - @penumbra-zone/types@13.0.0
  - @penumbra-zone/wasm@13.0.0

## 9.1.0

### Minor Changes

- bump @penumbra-labs/registry

## 9.0.0

### Minor Changes

- Synchronize published @buf deps

### Patch Changes

- Updated dependencies
  - @penumbra-zone/getters@10.0.0
  - @penumbra-zone/types@12.0.0
  - @penumbra-zone/wasm@12.0.0

## 8.0.0

### Major Changes

- bump registry

### Patch Changes

- Updated dependencies
  - @penumbra-zone/types@11.0.0
  - @penumbra-zone/wasm@11.0.0

## 7.1.0

### Minor Changes

- Bump registry

## 7.0.0

### Major Changes

- c555df7: switch to using IDB_VERSION defined inside the package

### Minor Changes

- 4161587: Update to latest bufbuild deps (v0.77.4)

### Patch Changes

- Updated dependencies [4161587]
- Updated dependencies [e207faa]
  - @penumbra-zone/getters@9.0.0
  - @penumbra-zone/types@10.0.0
  - @penumbra-zone/wasm@10.0.0

## 6.0.0

### Minor Changes

- 9b3f561: properly build esm relative paths

### Patch Changes

- Updated dependencies [9b3f561]
  - @penumbra-zone/bech32m@6.1.0
  - @penumbra-zone/getters@8.0.0
  - @penumbra-zone/types@9.0.0
  - @penumbra-zone/wasm@9.0.0

## 5.0.0

### Major Changes

- f067fab: reconfigure all package builds

### Patch Changes

- Updated dependencies [f067fab]
  - @penumbra-zone/bech32m@6.0.0
  - @penumbra-zone/getters@7.0.0
  - @penumbra-zone/types@8.0.0
  - @penumbra-zone/wasm@8.0.0

## 4.0.1

### Patch Changes

- Updated dependencies [a75256f]
- Updated dependencies [468ecc7]
- Updated dependencies [a75256f]
  - @penumbra-zone/bech32m@5.1.0
  - @penumbra-zone/getters@6.2.0
  - @penumbra-zone/crypto-web@3.0.11

## 4.0.0

### Major Changes

- 4012c48: remove chrome storage exports

### Minor Changes

- ab9d743: decouple service/rpc init
- e7d7ffc: 'chrome-extension': Add an onboarding screen for the default frontend selection

  '@penumbra-zone/storage': Remove the MINIFRONT_URL env usages

  '@penumbra-zone/ui': Don't show the image in SelectList.Option component if it is not passed

### Patch Changes

- adf3a28: Update to june 12 testnet registry
- Updated dependencies [6b06e04]
  - @penumbra-zone/getters@6.1.0
  - @penumbra-zone/crypto-web@3.0.10

## 3.4.3

### Patch Changes

- Updated dependencies [8fe4de6]
  - @penumbra-zone/bech32m@5.0.0
  - @penumbra-zone/getters@6.0.0
  - @penumbra-zone/crypto-web@3.0.9

## 3.4.2

### Patch Changes

- Updated dependencies [8b121ec]
  - @penumbra-zone/bech32m@4.0.0
  - @penumbra-zone/getters@5.0.0
  - @penumbra-zone/crypto-web@3.0.8

## 3.4.1

### Patch Changes

- a22d3a8: Update registry (noble/testnet channel update)

## 3.4.0

### Minor Changes

- 3ea1e6c: update buf types dependencies

### Patch Changes

- Updated dependencies [120b654]
- Updated dependencies [3ea1e6c]
  - @penumbra-zone/getters@4.1.0
  - @penumbra-zone/bech32m@3.2.0
  - @penumbra-zone/crypto-web@3.0.7

## 3.3.0

### Minor Changes

- e47a04e: Update registry to latest (fixes labs + adds starling)
- e4c9fce: Add features to handle auction withdrawals

### Patch Changes

- e35c6f7: Deps bumped to latest
- d6b8a23: Update registry
- Updated dependencies [146b48d]
- Updated dependencies [8ccaf30]
- Updated dependencies [8ccaf30]
- Updated dependencies [e35c6f7]
- Updated dependencies [cf63b30]
- Updated dependencies [8ccaf30]
  - @penumbra-zone/getters@4.0.0
  - @penumbra-zone/bech32m@3.1.1
  - @penumbra-zone/crypto-web@3.0.6

## 3.2.0

### Minor Changes

- v8.0.0 versioning and manifest

### Patch Changes

- 610a445: update osmosis channel for deimos-8
- Updated dependencies
  - @penumbra-zone/bech32m@3.1.0
  - @penumbra-zone/getters@3.0.2
  - @penumbra-zone/crypto-web@3.0.5

## 3.1.2

### Patch Changes

- Updated dependencies [8410d2f]
  - @penumbra-zone/bech32m@3.0.1
  - @penumbra-zone/getters@3.0.1
  - @penumbra-zone/crypto-web@3.0.4

## 3.1.1

### Patch Changes

- @penumbra-zone/crypto-web@3.0.3

## 3.1.0

### Minor Changes

- 55f31c9: Store sct positions of swaps

### Patch Changes

- Updated dependencies [3148375]
- Updated dependencies [fdd4303]
  - @penumbra-zone/constants@4.0.0
  - @penumbra-zone/getters@3.0.0
  - @penumbra-zone/bech32m@3.0.0
  - @penumbra-zone/crypto-web@3.0.2

## 3.0.1

### Patch Changes

- Updated dependencies [862283c]
  - @penumbra-zone/constants@3.0.0
  - @penumbra-zone/getters@2.0.1
  - @penumbra-zone/crypto-web@3.0.1

## 3.0.0

### Major Changes

- 76302da: Drop /src/ requirement for imports

### Patch Changes

- Updated dependencies [b4082b7]
  - @penumbra-zone/crypto-web@3.0.0

## 2.0.1

### Patch Changes

- 66c2407: v6.2.0 release

## 2.0.0

### Major Changes

- 929d278: barrel imports to facilitate better tree shaking

### Patch Changes

- 8933117: Account for changes to core
- Updated dependencies [8933117]
- Updated dependencies [929d278]
  - @penumbra-zone/constants@2.0.0
  - @penumbra-zone/getters@2.0.0
  - @penumbra-zone/bech32@2.0.0
  - @penumbra-zone/crypto-web@2.0.0

## 1.0.2

### Patch Changes

- Updated dependencies
  - @penumbra-zone/constants@1.1.0
  - @penumbra-zone/getters@1.1.0
  - @penumbra-zone/crypto-web@1.0.1
