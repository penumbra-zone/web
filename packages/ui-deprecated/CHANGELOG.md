# @penumbra-zone/ui

## 14.0.0

### Patch Changes

- Updated dependencies [6869c52]
- Updated dependencies [29dd11a]
  - @penumbra-zone/types@28.0.0
  - @penumbra-zone/protobuf@7.1.0
  - @penumbra-zone/bech32m@12.0.0
  - @penumbra-zone/perspective@45.0.0

## 13.0.2

### Patch Changes

- @penumbra-zone/perspective@44.0.0

## 13.0.1

### Patch Changes

- Updated dependencies [ebc58d2]
  - @penumbra-zone/types@27.1.0
  - @penumbra-zone/perspective@43.0.0

## 13.0.0

### Patch Changes

- Updated dependencies [95d5fd9]
  - @penumbra-zone/protobuf@7.0.0
  - @penumbra-zone/bech32m@11.0.0
  - @penumbra-zone/types@27.0.0
  - @penumbra-zone/perspective@42.0.0

## 12.4.6

### Patch Changes

- Updated dependencies [d619836]
  - @penumbra-zone/types@26.4.0
  - @penumbra-zone/perspective@41.0.0

## 12.4.5

### Patch Changes

- 39a9fd9: Fixed tab width grow setting

## 12.4.4

### Patch Changes

- Updated dependencies [712e7b1]
  - @penumbra-zone/types@26.3.0
  - @penumbra-zone/perspective@40.0.0

## 12.4.3

### Patch Changes

- Updated dependencies [838de8a]
  - @penumbra-zone/types@26.2.1
  - @penumbra-zone/perspective@39.0.0

## 12.4.2

### Patch Changes

- Updated dependencies [291bc7d]
  - @penumbra-zone/types@26.2.0
  - @penumbra-zone/perspective@38.0.0

## 12.4.1

### Patch Changes

- @penumbra-zone/perspective@37.0.0

## 12.4.0

### Minor Changes

- fcb025d: Update @penumbra-zone/ui exports

## 12.3.0

### Minor Changes

- 2484bdc: Add ReactNode proptype to description Toast prop

## 12.2.1

### Patch Changes

- 185728a: Fix and improve UI components to prepare them for sub-account selector

## 12.2.0

### Minor Changes

- ef1a89d: Add theme and lib/toast exports

## 12.1.0

### Minor Changes

- e3778eb: Add `ToastProvider` and `openToast` function to the v2 UI components

### Patch Changes

- 7c1d4e7: Improve hot reloading
- Updated dependencies [b5d2922]
  - @penumbra-zone/types@26.1.0
  - @penumbra-zone/perspective@36.0.0

## 12.0.0

### Patch Changes

- Updated dependencies [3269282]
  - @penumbra-zone/protobuf@6.3.0
  - @penumbra-zone/bech32m@10.0.0
  - @penumbra-zone/perspective@35.0.0
  - @penumbra-zone/types@26.0.0

## 11.0.2

### Patch Changes

- 74b53af: Fix asset selector not firing onChange event

## 11.0.1

### Patch Changes

- @penumbra-zone/perspective@34.0.0

## 11.0.0

### Minor Changes

- deb04f5: Add `Dialog.RadioGroup` and `Dialog.RadioItem` components

### Patch Changes

- 9d68f48: fix `copyable` prop on `AddressViewComponent`
- dad8165: Add ellipsis to `ValueViewComponent`
- Updated dependencies [e543db4]
  - @penumbra-zone/protobuf@6.2.0
  - @penumbra-zone/perspective@33.0.0
  - @penumbra-zone/bech32m@9.0.0
  - @penumbra-zone/types@25.0.0

## 10.0.2

### Patch Changes

- 4885420: Fix AssetSelector filtering and display

## 10.0.1

### Patch Changes

- 4295109: - Add a temporary zIndex prop to the Dialog component. It is only needed for minifront v1 and must be removed when we stop supporting the v1.
  - Improve the styles of the v2 sync bar and popover
  - @penumbra-zone/perspective@32.0.0

## 10.0.0

### Patch Changes

- Updated dependencies [b6e32f8]
- Updated dependencies [b6e32f8]
- Updated dependencies [b6e32f8]
  - @penumbra-zone/protobuf@6.1.0
  - @penumbra-zone/bech32m@8.0.0
  - @penumbra-zone/types@24.0.0
  - @penumbra-zone/perspective@31.0.0

## 9.2.0

### Minor Changes

- b1d4b7d: Add `AssetSelector` UI component
- de9bd06: Add `SwapInput` and `ValueInput` UI components
- 43d8350: Fix the issue of UI package not being build correctly for some server-side environments

### Patch Changes

- 75ef4f5: Fix copy button styles

## 9.1.1

### Patch Changes

- @penumbra-zone/perspective@30.0.0
- @penumbra-zone/types@23.0.0

## 9.1.0

### Minor Changes

- 74e89e0: UI:

  - Add new `Progress` component
  - Add `MenuItem` component that shares the styles with `DropdownMenu.Item`
  - Update the `Pill` component to support `context` prop
  - Update the `Tabs` component to support the `compact` density
  - Allow passing custom icons to the `Button`
  - Fix `density` tag in Storybook

  Tailwind Config:

  - Add support for v2 colors with v2 prefix like `bg-v2-secondary-dark`

  Minifront:

  - Add top navigation to the v2 minifront with sync bar and prax connection infos

- d938456: Add Slider Component

### Patch Changes

- 516caf3: Fix z-index of dialog content
- 5100518: Update UI components: `ValueViewComponent`, `AssetIcon`, and `Popover`
- Updated dependencies [e01d5f8]
  - @penumbra-zone/types@22.0.0
  - @penumbra-zone/perspective@29.0.0

## 9.0.0

### Major Changes

- a8a5f41: Prepare UI package for publishing to NPM

### Minor Changes

- e7d0767: Support for displaying LP position action views

### Patch Changes

- Updated dependencies [e7d0767]
  - @penumbra-zone/perspective@28.0.0

## 8.2.0

### Minor Changes

- d01196a: Add WalletBalance UI component
- 74f9a7f: Remove browser & version check

### Patch Changes

- e952e03: remove BSR dependencies, correctly specify @bufbuild and @connectrpc dependencies
- Updated dependencies [e952e03]
  - @penumbra-zone/perspective@27.0.0

## 8.1.0

### Minor Changes

- e4a4dd7: Fix font alignments & sync dialog
- 7732f8d: Add Popover UI component
- 2788cf0: Add DropdownMenu UI component
- 907f6ee: Add Banner and IncompatableBrowserBanner

### Patch Changes

- @penumbra-zone/perspective@26.0.0
- @penumbra-zone/types@21.0.0

## 8.0.0

### Minor Changes

- 6fd8ce6: Compress fonts (ttf -> woff2)
- 2a76fce: Create <Card />'s subcomponents; create <FormField /> and <TextInput />; add some features re: disabled fields

### Patch Changes

- Updated dependencies [49263c6]
  - @penumbra-zone/protobuf@6.0.0
  - @penumbra-zone/bech32m@7.0.0
  - @penumbra-zone/perspective@25.0.0
  - @penumbra-zone/types@20.0.0

## 7.4.1

### Patch Changes

- e6f019e: Fix sidebar font

## 7.4.0

### Minor Changes

- 10ef940: Updating to v0.80.0 bufbuild types

### Patch Changes

- Updated dependencies [10ef940]
  - @penumbra-zone/perspective@24.0.0
  - @penumbra-zone/types@19.0.0

## 7.3.4

### Patch Changes

- 0069132: Fix copy button styles
- Updated dependencies [bd43d49]
- Updated dependencies [807648a]
  - @penumbra-zone/types@18.2.0
  - @penumbra-zone/perspective@23.0.0

## 7.3.3

### Patch Changes

- @penumbra-zone/perspective@22.0.0

## 7.3.2

### Patch Changes

- Updated dependencies [f5bea48]
  - @penumbra-zone/types@18.1.0
  - @penumbra-zone/perspective@21.0.0

## 7.3.1

### Patch Changes

- Updated dependencies [a9ffd2d]
  - @penumbra-zone/types@18.0.0
  - @penumbra-zone/perspective@20.0.0

## 7.3.0

### Minor Changes

- dfad32b: fix auctions source
- 49fb3f1: Create <Table /> component; introduce <Density />
- Update registry dep

### Patch Changes

- Updated dependencies [40a471d]
  - @penumbra-zone/perspective@19.0.0

## 7.2.1

### Patch Changes

- Updated dependencies [3477bef]
  - @penumbra-zone/types@17.0.1

## 7.2.0

### Minor Changes

- 54a5d66: Add Button/ButtonGroup/SegmentedPicker components

## 7.1.0

### Minor Changes

- 86c1bbe: Add support for delegate vote action views

### Patch Changes

- @penumbra-zone/types@17.0.0

## 7.0.3

### Patch Changes

- 26bd932: Shows the green checkmark icon for all filled dutch auctions
- Updated dependencies [0233722]
  - @penumbra-zone/types@16.1.0

## 7.0.2

### Patch Changes

- @penumbra-zone/types@16.0.0

## 7.0.1

### Patch Changes

- Updated dependencies [3aaead1]
  - @penumbra-zone/types@15.1.1

## 7.0.0

### Major Changes

- 3b7a289: Utilize v10 remote registry methods

### Minor Changes

- 3c91e8b: UI: update CopyToClipboard component. Minifront: add information about ibc-in new address generation

### Patch Changes

- cbc2419: Stop truncating metadata symbols programatically
- cbc2419: Storage: bump IDB version. UI: fix Dialog rendering on mobile screens. Minifront: fix metadata symbol truncation.
- Updated dependencies [877fb1f]
  - @penumbra-zone/types@15.1.0

## 6.6.0

### Minor Changes

- fa798d9: Bufbuild + registry dep update

### Patch Changes

- Updated dependencies [fa798d9]
  - @penumbra-zone/types@15.0.0

## 6.5.0

### Minor Changes

- 28a48d7: Updated ActionViewComponent to support FeeView

### Patch Changes

- Updated dependencies [28a48d7]
  - @penumbra-zone/types@14.0.0

## 6.4.0

### Minor Changes

- 8e68481: Update to v9.3.0 registry

### Patch Changes

- 1ae30d8: Render the timeout time in withdrawal transactions in UTC format
- Updated dependencies [43ccd96]
  - @penumbra-zone/types@13.1.0

## 6.3.1

### Patch Changes

- 248300c: Display epoch index in undelegate TX action
- Updated dependencies [3708e2c]
  - @penumbra-zone/bech32m@6.1.1
  - @penumbra-zone/types@13.0.0

## 6.3.0

### Minor Changes

- bump @penumbra-labs/registry

## 6.2.1

### Patch Changes

- Updated dependencies
  - @penumbra-zone/types@12.0.0

## 6.2.0

### Minor Changes

- bump registry

### Patch Changes

- Updated dependencies
  - @penumbra-zone/types@11.0.0

## 6.1.0

### Minor Changes

- Bump registry

## 6.0.0

### Major Changes

- 24d9bfa: UI: refactor the package to provide better and more clear exports. Includes a readme with setting up the UI package and more storybook stories.

### Minor Changes

- 4161587: Update to latest bufbuild deps (v0.77.4)

### Patch Changes

- 97b7231: Minifront:

  - extend `BalanceSelector` to show not only assets with balances but all available assets
  - fix the issues with empty wallets not rendering a swap block correctly
  - reduce the height of `BalanceSelecor` and `AssetSelector` to `90dvh`
  - autofocus the search inputs in `BalanceSelecor` and `AssetSelector`
  - change validations of the swap input to allow entering any possible values

  UI: allow passing `autoFocus` attribute to the `IconInput` component

- Updated dependencies [4161587]
  - @penumbra-zone/types@10.0.0

## 5.0.0

### Minor Changes

- d8825f9: UI: add `compact` prop to render a minimalistic version of the AccountSwitcher component.

  Minifront: use AccountSwitcher in the IBC-in form

### Patch Changes

- f5c511e: Fix a few layout issues with the header
- Updated dependencies [9b3f561]
  - @penumbra-zone/perspective@6.0.0
  - @penumbra-zone/bech32m@6.1.0
  - @penumbra-zone/getters@8.0.0
  - @penumbra-zone/types@9.0.0

## 4.0.0

### Major Changes

- f067fab: reconfigure all package builds

### Minor Changes

- 1ee18e0: relocate navigationmenu into minifront

### Patch Changes

- Updated dependencies [f067fab]
  - @repo/tailwind-config@3.0.0
  - @penumbra-zone/perspective@5.0.0
  - @penumbra-zone/bech32m@6.0.0
  - @penumbra-zone/getters@7.0.0
  - @penumbra-zone/types@8.0.0

## 3.5.0

### Minor Changes

- 6b78e22: Tweaks to the auction UI; create a new PopoverMenu component

### Patch Changes

- Updated dependencies [a75256f]
- Updated dependencies [468ecc7]
- Updated dependencies [a75256f]
  - @penumbra-zone/bech32m@5.1.0
  - @penumbra-zone/getters@6.2.0
  - @penumbra-zone/perspective@4.0.2
  - @penumbra-zone/types@7.1.1

## 3.4.0

### Minor Changes

- ab9d743: decouple service/rpc init
- 282eabf: Click wallet for max amount
- 0076a1d: add candlestick component
- 24c8b4f: Add ActionDetails.TruncatedText component

### Patch Changes

- 6b06e04: Introduce ZQuery package and use throughout minifront
- 24c8b4f: fix delegation prompting window being too wide
- e7d7ffc: 'chrome-extension': Add an onboarding screen for the default frontend selection

  '@penumbra-zone/storage': Remove the MINIFRONT_URL env usages

  '@penumbra-zone/ui': Don't show the image in SelectList.Option component if it is not passed

- Updated dependencies [ab9d743]
- Updated dependencies [282eabf]
- Updated dependencies [6b06e04]
- Updated dependencies [c8e8d15]
  - @penumbra-zone/types@7.1.0
  - @penumbra-zone/getters@6.1.0
  - @penumbra-zone/perspective@4.0.1

## 3.3.2

### Patch Changes

- Updated dependencies [8fe4de6]
  - @penumbra-zone/perspective@4.0.0
  - @penumbra-zone/bech32m@5.0.0
  - @penumbra-zone/getters@6.0.0
  - @penumbra-zone/types@7.0.1

## 3.3.1

### Patch Changes

- bb5f621: formatAmount() takes new args
- Updated dependencies [bb5f621]
- Updated dependencies [8b121ec]
  - @penumbra-zone/types@7.0.0
  - @penumbra-zone/perspective@3.0.0
  - @penumbra-zone/bech32m@4.0.0
  - @penumbra-zone/getters@5.0.0

## 3.3.0

### Minor Changes

- 120b654: Support estimates of outputs for auctions; redesign the estimate results part of the swap/auction UI
- 3ea1e6c: update buf types dependencies

### Patch Changes

- fc9418c: Fixed a couple bugs, and displayed the auction ID in its details.
- Updated dependencies [120b654]
- Updated dependencies [029eebb]
- Updated dependencies [3ea1e6c]
  - @penumbra-zone/getters@4.1.0
  - @penumbra-zone/types@6.0.0
  - @penumbra-zone/perspective@2.1.0
  - @penumbra-zone/bech32m@3.2.0

## 3.2.0

### Minor Changes

- d8fef48: Update design of DutchAuctionComponent; add filtering to auctions
- 5b80e7c: Add animations to SegmentedPicker

### Patch Changes

- @penumbra-zone/perspective@2.0.1

## 3.1.0

### Minor Changes

- cf63b30: Show swap routes in the UI; extract a <TokenSwapInput /> component.
- e4c9fce: Add features to handle auction withdrawals
- 43bf99f: Add a UI to inspect an address; create a <Box /> component

### Patch Changes

- e35c6f7: Deps bumped to latest
- 8a3b442: optimize animation
- Updated dependencies [146b48d]
- Updated dependencies [8ccaf30]
- Updated dependencies [8ccaf30]
- Updated dependencies [e35c6f7]
- Updated dependencies [cf63b30]
- Updated dependencies [e4c9fce]
- Updated dependencies [8ccaf30]
  - @penumbra-zone/getters@4.0.0
  - @penumbra-zone/types@5.0.0
  - @penumbra-zone/perspective@2.0.0
  - @penumbra-zone/bech32m@3.1.1

## 3.0.0

### Major Changes

- v8.0.0 versioning and manifest

### Patch Changes

- Updated dependencies
  - @penumbra-zone/bech32m@3.1.0
  - @penumbra-zone/types@4.1.0
  - @penumbra-zone/getters@3.0.2
  - @penumbra-zone/perspective@1.0.6

## 2.0.5

### Patch Changes

- Updated dependencies [8410d2f]
  - @penumbra-zone/bech32m@3.0.1
  - @penumbra-zone/getters@3.0.1
  - @penumbra-zone/perspective@1.0.5
  - @penumbra-zone/types@4.0.1

## 2.0.4

### Patch Changes

- Updated dependencies [6fb898a]
  - @penumbra-zone/types@4.0.0
  - @penumbra-zone/perspective@1.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [3148375]
- Updated dependencies [fdd4303]
  - @penumbra-zone/constants@4.0.0
  - @penumbra-zone/getters@3.0.0
  - @penumbra-zone/types@3.0.0
  - @penumbra-zone/bech32m@3.0.0
  - @penumbra-zone/perspective@1.0.3

## 2.0.2

### Patch Changes

- Updated dependencies [862283c]
  - @penumbra-zone/constants@3.0.0
  - @penumbra-zone/perspective@1.0.2
  - @penumbra-zone/getters@2.0.1
  - @penumbra-zone/types@2.0.1

## 2.0.1

### Patch Changes

- @penumbra-zone/perspective@1.0.1

## 2.0.0

### Major Changes

- 929d278: barrel imports to facilitate better tree shaking

### Minor Changes

- 7a1efed: Added warning toast

### Patch Changes

- 8933117: Account for changes to core
- Updated dependencies [929d278]
  - @penumbra-zone/perspective@1.0.0
  - @penumbra-zone/getters@2.0.0
  - @penumbra-zone/bech32@2.0.0
  - @penumbra-zone/types@2.0.0

## 1.0.2

### Patch Changes

- Updated dependencies
  - @penumbra-zone/getters@1.1.0
  - @penumbra-zone/types@1.1.0
