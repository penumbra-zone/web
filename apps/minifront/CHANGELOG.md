# minifront

## 6.5.0

### Minor Changes

- 7ab06b7: Add query parameters to the swap page to allow pre-setting swap assets

## 6.4.0

### Minor Changes

- bump registry

### Patch Changes

- Updated dependencies
  - @penumbra-zone/types@11.0.0
  - @repo/ui@6.2.0
  - @penumbra-zone/crypto-web@7.0.0
  - @penumbra-zone/perspective@8.0.0

## 6.3.0

### Minor Changes

- Bump registry

### Patch Changes

- bce49fe: Update revision number parsing logic
- Updated dependencies
  - @repo/ui@6.1.0

## 6.2.1

### Patch Changes

- Updated dependencies [09b935b]
  - @penumbra-zone/client@9.0.1

## 6.2.0

### Minor Changes

- 97b7231: Minifront:

  - extend `BalanceSelector` to show not only assets with balances but all available assets
  - fix the issues with empty wallets not rendering a swap block correctly
  - reduce the height of `BalanceSelecor` and `AssetSelector` to `90dvh`
  - autofocus the search inputs in `BalanceSelecor` and `AssetSelector`
  - change validations of the swap input to allow entering any possible values

  UI: allow passing `autoFocus` attribute to the `IconInput` component

- 0d78031: fixed bugs related to unknown assets

### Patch Changes

- 733d62a: Stop using loader functions for most routes; fix typings issue in ZQuery
- 24d9bfa: UI: refactor the package to provide better and more clear exports. Includes a readme with setting up the UI package and more storybook stories.
- Updated dependencies [733d62a]
- Updated dependencies [4161587]
- Updated dependencies [97b7231]
- Updated dependencies [47c6bc0]
- Updated dependencies [47c6bc0]
- Updated dependencies [24d9bfa]
  - @penumbra-zone/zquery@2.0.1
  - @penumbra-zone/perspective@7.0.0
  - @penumbra-zone/protobuf@5.2.0
  - @penumbra-zone/getters@9.0.0
  - @penumbra-zone/types@10.0.0
  - @repo/ui@6.0.0
  - @penumbra-zone/client@9.0.0
  - @penumbra-zone/transport-dom@7.2.0
  - @penumbra-zone/crypto-web@6.0.0

## 6.1.0

### Minor Changes

- d8825f9: UI: add `compact` prop to render a minimalistic version of the AccountSwitcher component.

  Minifront: use AccountSwitcher in the IBC-in form

### Patch Changes

- f5c511e: Fix a few layout issues with the header
- Updated dependencies [9b3f561]
- Updated dependencies [d8825f9]
- Updated dependencies [f5c511e]
  - @penumbra-zone/transport-dom@7.1.0
  - @penumbra-zone/perspective@6.0.0
  - @penumbra-zone/protobuf@5.1.0
  - @penumbra-zone/bech32m@6.1.0
  - @penumbra-zone/getters@8.0.0
  - @penumbra-zone/client@8.0.0
  - @penumbra-zone/crypto-web@5.0.0
  - @penumbra-zone/types@9.0.0
  - @repo/ui@5.0.0

## 6.0.0

### Major Changes

- f067fab: reconfigure all package builds

### Minor Changes

- 7ac610e: Beef up ZQuery's handling of streams; take advantage of it in minifront.

  BREAKING CHANGE: The `stream` property passed to `createZQuery()` should now return an object containing at least an `onValue` method. See the docs for the `stream` property for more info.

### Patch Changes

- Updated dependencies [1ee18e0]
- Updated dependencies [7ac610e]
- Updated dependencies [f067fab]
- Updated dependencies [1ee18e0]
- Updated dependencies [f8b6193]
  - @repo/ui@4.0.0
  - @penumbra-zone/zquery@2.0.0
  - @penumbra-zone/transport-dom@7.0.0
  - @penumbra-zone/perspective@5.0.0
  - @penumbra-zone/protobuf@5.0.0
  - @penumbra-zone/bech32m@6.0.0
  - @penumbra-zone/getters@7.0.0
  - @penumbra-zone/client@7.0.0
  - @penumbra-zone/crypto-web@4.0.0
  - @penumbra-zone/types@8.0.0

## 5.2.0

### Minor Changes

- 6b78e22: Tweaks to the auction UI; create a new PopoverMenu component

### Patch Changes

- 0f30eea: Ensure sane inputs for the swap/auction UI
- 89a0f22: Use the localSeq property to fix auction UI bugs
- Updated dependencies [a75256f]
- Updated dependencies [82068fc]
- Updated dependencies [468ecc7]
- Updated dependencies [a75256f]
- Updated dependencies [6b78e22]
  - @penumbra-zone/bech32m@5.1.0
  - @penumbra-zone/zquery@1.0.1
  - @penumbra-zone/getters@6.2.0
  - @penumbra-zone/protobuf@4.2.0
  - @penumbra-zone/client@6.1.0
  - @penumbra-zone/ui@3.5.0
  - @penumbra-zone/perspective@4.0.2
  - @penumbra-zone/types@7.1.1
  - @penumbra-zone/crypto-web@3.0.11

## 5.1.0

### Minor Changes

- 282eabf: Click wallet for max amount

### Patch Changes

- 20bb7ac: fix destination address validation in the "shield funds" page
- adf3a28: Update to june 12 testnet registry
- 6b06e04: Introduce ZQuery package and use throughout minifront
- cf2594d: add display for the both in- and out-tokens on the swap page
- 94e3240: Change styles of the unclaimed swap block
- Updated dependencies [ab9d743]
- Updated dependencies [282eabf]
- Updated dependencies [0076a1d]
- Updated dependencies [81b9536]
- Updated dependencies [3be0580]
- Updated dependencies [6b06e04]
- Updated dependencies [24c8b4f]
- Updated dependencies [c8e8d15]
- Updated dependencies [24c8b4f]
- Updated dependencies [e7d7ffc]
  - @penumbra-zone/types@7.1.0
  - @penumbra-zone/ui@3.4.0
  - @penumbra-zone/protobuf@4.1.0
  - @penumbra-zone/client@6.0.1
  - @penumbra-zone/zquery@1.0.0
  - @penumbra-zone/getters@6.1.0
  - @penumbra-zone/crypto-web@3.0.10
  - @penumbra-zone/perspective@4.0.1

## 5.0.3

### Patch Changes

- Updated dependencies [8fe4de6]
  - @penumbra-zone/transport-dom@6.0.0
  - @penumbra-zone/perspective@4.0.0
  - @penumbra-zone/protobuf@4.0.0
  - @penumbra-zone/bech32m@5.0.0
  - @penumbra-zone/getters@6.0.0
  - @penumbra-zone/client@6.0.0
  - @penumbra-zone/ui@3.3.2
  - @penumbra-zone/types@7.0.1
  - @penumbra-zone/crypto-web@3.0.9

## 5.0.2

### Patch Changes

- bb5f621: formatAmount() takes new args
- Updated dependencies [bb5f621]
- Updated dependencies [8b121ec]
  - @penumbra-zone/types@7.0.0
  - @penumbra-zone/ui@3.3.1
  - @penumbra-zone/transport-dom@5.0.0
  - @penumbra-zone/perspective@3.0.0
  - @penumbra-zone/protobuf@3.0.0
  - @penumbra-zone/bech32m@4.0.0
  - @penumbra-zone/getters@5.0.0
  - @penumbra-zone/client@5.0.0
  - @penumbra-zone/crypto-web@3.0.8

## 5.0.1

### Patch Changes

- a22d3a8: Update registry (noble/testnet channel update)

## 5.0.0

### Major Changes

- 029eebb: use service definitions from protobuf collection package

### Minor Changes

- 120b654: Support estimates of outputs for auctions; redesign the estimate results part of the swap/auction UI
- 3ea1e6c: update buf types dependencies

### Patch Changes

- Updated dependencies [fc9418c]
- Updated dependencies [120b654]
- Updated dependencies [4f8c150]
- Updated dependencies [029eebb]
- Updated dependencies [029eebb]
- Updated dependencies [3ea1e6c]
  - @penumbra-zone/ui@3.3.0
  - @penumbra-zone/getters@4.1.0
  - @penumbra-zone/protobuf@2.1.0
  - @penumbra-zone/types@6.0.0
  - @penumbra-zone/transport-dom@4.1.0
  - @penumbra-zone/perspective@2.1.0
  - @penumbra-zone/bech32m@3.2.0
  - @penumbra-zone/client@4.2.0
  - @penumbra-zone/crypto-web@3.0.7

## 4.6.0

### Minor Changes

- d8fef48: Update design of DutchAuctionComponent; add filtering to auctions

### Patch Changes

- Updated dependencies [d8fef48]
- Updated dependencies [5b80e7c]
  - @penumbra-zone/ui@3.2.0
  - @penumbra-zone/perspective@2.0.1

## 4.5.0

### Minor Changes

- e47a04e: Update registry to latest (fixes labs + adds starling)
- a241386: Combine the swap and auction forms
- 146b48d: Support GDAs
- cf63b30: Show swap routes in the UI; extract a <TokenSwapInput /> component.
- e4c9fce: Add features to handle auction withdrawals

### Patch Changes

- d654724: Fix error splash screen
- 9563ed0: Fix a bug where multiple responses streamed to the same state variable simultaneously
- e35c6f7: Deps bumped to latest
- d6b8a23: Update registry
- 43bf99f: Add a UI to inspect an address; create a <Box /> component
- Updated dependencies [146b48d]
- Updated dependencies [8ccaf30]
- Updated dependencies [8ccaf30]
- Updated dependencies [e35c6f7]
- Updated dependencies [cf63b30]
- Updated dependencies [e4c9fce]
- Updated dependencies [8a3b442]
- Updated dependencies [43bf99f]
- Updated dependencies [8ccaf30]
  - @penumbra-zone/getters@4.0.0
  - @penumbra-zone/types@5.0.0
  - @penumbra-zone/perspective@2.0.0
  - @penumbra-zone/bech32m@3.1.1
  - @penumbra-zone/ui@3.1.0
  - @penumbra-zone/crypto-web@3.0.6
  - @penumbra-zone/client@4.1.2

## 4.4.0

### Minor Changes

- v8.0.0 versioning and manifest

### Patch Changes

- 610a445: update osmosis channel for deimos-8
- Updated dependencies
  - @penumbra-zone/ui@3.0.0
  - @penumbra-zone/bech32m@3.1.0
  - @penumbra-zone/types@4.1.0
  - @penumbra-zone/getters@3.0.2
  - @penumbra-zone/perspective@1.0.6
  - @penumbra-zone/client@4.1.1
  - @penumbra-zone/crypto-web@3.0.5

## 4.3.3

### Patch Changes

- Updated dependencies [8410d2f]
- Updated dependencies [8410d2f]
  - @penumbra-zone/bech32m@3.0.1
  - @penumbra-zone/client@4.1.0
  - @penumbra-zone/getters@3.0.1
  - @penumbra-zone/perspective@1.0.5
  - @penumbra-zone/types@4.0.1
  - @penumbra-zone/ui@2.0.5
  - @penumbra-zone/crypto-web@3.0.4

## 4.3.2

### Patch Changes

- Updated dependencies [fc500af]
- Updated dependencies [6fb898a]
  - @penumbra-zone/transport-dom@4.0.0
  - @penumbra-zone/types@4.0.0
  - @penumbra-zone/client@4.0.1
  - @penumbra-zone/crypto-web@3.0.3
  - @penumbra-zone/perspective@1.0.4
  - @penumbra-zone/ui@2.0.4

## 4.3.1

### Patch Changes

- Updated dependencies [3148375]
- Updated dependencies [fdd4303]
  - @penumbra-zone/transport-dom@3.0.0
  - @penumbra-zone/constants@4.0.0
  - @penumbra-zone/getters@3.0.0
  - @penumbra-zone/client@4.0.0
  - @penumbra-zone/types@3.0.0
  - @penumbra-zone/bech32m@3.0.0
  - @penumbra-zone/ui@2.0.3
  - @penumbra-zone/crypto-web@3.0.2
  - @penumbra-zone/perspective@1.0.3

## 4.3.0

### Minor Changes

- 862283c: Using external registry for ibc chains

### Patch Changes

- Updated dependencies [862283c]
  - @penumbra-zone/constants@3.0.0
  - @penumbra-zone/perspective@1.0.2
  - @penumbra-zone/getters@2.0.1
  - @penumbra-zone/types@2.0.1
  - @penumbra-zone/ui@2.0.2
  - @penumbra-zone/client@3.0.1
  - @penumbra-zone/crypto-web@3.0.1

## 4.2.0

### Minor Changes

- v6.3 ext updates: loading indicator, portfolio viewing, bug fixes

### Patch Changes

- Updated dependencies [b4082b7]
  - @penumbra-zone/crypto-web@3.0.0

## 4.1.0

### Minor Changes

- 66c2407: v6.2.0 release

### Patch Changes

- @penumbra-zone/perspective@1.0.1
- @penumbra-zone/ui@2.0.1

## 4.0.0

### Major Changes

- 929d278: barrel imports to facilitate better tree shaking

### Patch Changes

- Updated dependencies [7a1efed]
- Updated dependencies [7a1efed]
- Updated dependencies [8933117]
- Updated dependencies [929d278]
  - @penumbra-zone/client@3.0.0
  - @penumbra-zone/ui@2.0.0
  - @penumbra-zone/constants@2.0.0
  - @penumbra-zone/perspective@1.0.0
  - @penumbra-zone/getters@2.0.0
  - @penumbra-zone/bech32@2.0.0
  - @penumbra-zone/crypto-web@2.0.0
  - @penumbra-zone/types@2.0.0
  - @penumbra-zone/transport-dom@2.0.0

## 3.0.0

### Major Changes

- Initial changest. Git tag v5.0.0 updates.

### Patch Changes

- Updated dependencies
  - @penumbra-zone/client@2.0.0
  - @penumbra-zone/constants@1.1.0
  - @penumbra-zone/getters@1.1.0
  - @penumbra-zone/transport-dom@1.1.0
  - @penumbra-zone/types@1.1.0
  - @penumbra-zone/ui@1.0.2
  - @penumbra-zone/crypto-web@1.0.1
