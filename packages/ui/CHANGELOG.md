# @penumbra-zone/ui

## 16.0.4

### Patch Changes

- d170339: Implement comprehensive staking page for minifront-v2

  - Add complete delegation management with validator selection and amount input
  - Implement responsive staking assets overview with account-reactive balance display
  - Add delegation tokens section with proper validator info parsing and ValueView integration
  - Minimalistic transaction UX via Button content & auto-closing dialog (Toast component integration tbd)
  - Enhanced unbonding token formatting for Assetcard on Portfolio Page

- a05953a: fix dialogue UI lib
- a6b95be: feat(minifront-v2): implement shielding page with deposit/withdraw flows

  Adds comprehensive shielding functionality to minifront-v2:

  - **New Shielding page** with Skip Deposit, Deposit, and Withdraw tabs
  - **ICS-20 withdrawals** working for both native (UM) and IBC assets
  - **Real-time activity updates** - transactions appear immediately after broadcast
  - **Wallet integration** for external chains (Cosmos Hub, Osmosis, etc.)
  - **Dynamic backgrounds** that switch between shield/unshield themes
  - **Recent activity tracking** with dedicated shielding transaction cards

  **UI package improvements:**

  - Enhanced AssetSelector
  - AssetValueInput UX polish
  - AddressView support for external address display
  - New IconAdornment component with storybook documentation

  **Technical issues/challenges related to this change:**

  - Resolved transaction planner 12-byte array parsing issue
  - Channel ID derivation for native assets
  - Proper MobX reactivity for instant UI updates
  - Improved deposit/withdraw form validation and error handling

## 16.0.3

### Patch Changes

- Updated dependencies [4657582]
  - @penumbra-zone/types@36.0.0
  - @penumbra-zone/perspective@61.1.1

## 16.0.2

### Patch Changes

- Updated dependencies [cca1b0f]
  - @penumbra-zone/perspective@61.1.0

## 16.0.1

### Patch Changes

- cda1a99: Update text in AddressView component
- Updated dependencies [bdb700d]
- Updated dependencies [f1e701a]
  - @penumbra-zone/types@35.0.0
  - @penumbra-zone/protobuf@11.0.0
  - @penumbra-zone/bech32m@18.0.0
  - @penumbra-zone/getters@28.0.0
  - @penumbra-zone/perspective@61.0.0

## 16.0.0

### Major Changes

- a42b5c2: Upgrade to Tailwind v4. Check UI package Readme file for more details.

### Minor Changes

- 54543d9: Update global.css style file with two new classes controlling the look of a scrollbar
- 23d578b: Add additional props to Icon & TextInput
- d3b1d78: feat: establish minifront-v2 app with Transactions UI and Transfer Page

### Patch Changes

- ad72bd1: Export ThemeColor
- 82700e9: Fix style export
- 9658941: Add input component into Pagination
- 14a8ccd: Fix dialog component placement for XL screens
- 044daa9: Remove absoluteStrokeWidth prop from Icon

## 15.0.2

### Patch Changes

- 82d034e: fix publish workflow
- Updated dependencies [82d034e]
  - @penumbra-zone/bech32m@17.0.1
  - @penumbra-zone/getters@27.0.1
  - @penumbra-zone/perspective@60.0.1
  - @penumbra-zone/protobuf@10.1.1
  - @penumbra-zone/types@34.2.1

## 15.0.1

### Patch Changes

- c770cd5: Add `whitespace-nowrap` class to all heading TableCells

## 15.0.0

### Major Changes

- dcfbe8a: Upgrade to React 19 and address forwardRef deprecation across the repo

### Patch Changes

- 78e36b8: Add `padStart` prop to `ValueViewComponent`
- 78e36b8: TableCell: add `justify` prop for content alignment
- dcfbe8a: feat(ui): Added v2 Portfolio Page layout including PortfolioBalance and AssetCard components. Setup dual-theme build process to avoid tailwind conflicts in minifront app (legacy vs. v2).
- 2066c86: Fix styles build
  - @penumbra-zone/perspective@60.0.0

## 14.0.4

### Patch Changes

- Updated dependencies [cee8150]
  - @penumbra-zone/types@34.2.0
  - @penumbra-zone/perspective@59.0.0

## 14.0.3

### Patch Changes

- Updated dependencies [ec85373]
- Updated dependencies [cba3daf]
  - @penumbra-zone/types@34.1.0
  - @penumbra-zone/perspective@58.0.0

## 14.0.2

### Patch Changes

- Updated dependencies [dc1eb8b]
- Updated dependencies [f9cd9dd]
  - @penumbra-zone/protobuf@10.1.0
  - @penumbra-zone/types@34.0.0
  - @penumbra-zone/bech32m@17.0.0
  - @penumbra-zone/getters@27.0.0
  - @penumbra-zone/perspective@57.0.0

## 14.0.1

### Patch Changes

- Updated dependencies [085e855]
  - @penumbra-zone/types@33.1.0
  - @penumbra-zone/perspective@56.0.0

## 14.0.0

### Major Changes

- 4a51a46: Remove forwardRef that was deprecated in React 19
- 4a51a46: Upgrade to React 19

## 13.18.0

### Minor Changes

- 93f1d05: proto and storage changes to support querying tournament votes

### Patch Changes

- 28a251c: Move `buttons` Dialog.Content's prop out of the scrollable area
- Updated dependencies [93f1d05]
  - @penumbra-zone/protobuf@10.0.0
  - @penumbra-zone/types@33.0.0
  - @penumbra-zone/bech32m@16.0.0
  - @penumbra-zone/getters@26.0.0
  - @penumbra-zone/perspective@55.0.0

## 13.17.4

### Patch Changes

- @penumbra-zone/perspective@54.0.0

## 13.17.3

### Patch Changes

- @penumbra-zone/perspective@53.0.2

## 13.17.2

### Patch Changes

- 405b5b1: Fix swap ActionViews not rendering values correctly
- Updated dependencies [405b5b1]
  - @penumbra-zone/getters@25.0.1
  - @penumbra-zone/types@32.2.1
  - @penumbra-zone/perspective@53.0.1

## 13.17.1

### Patch Changes

- Updated dependencies [ce4c43e]
  - @penumbra-zone/types@32.2.0
  - @penumbra-zone/perspective@53.0.0

## 13.17.0

### Minor Changes

- 8e6e60c: Add Checkbox UI component
- 5c45f2c: Implement `IbcRelay` and `Ics20Withdrawal` ActionViews

### Patch Changes

- 80148ae: Fix bugs related to transaction history and transaction/action views
- 3c48120: Fix Swap getters for ActionViews
- Updated dependencies [a5e14e9]
- Updated dependencies [b0e0eef]
- Updated dependencies [5c45f2c]
- Updated dependencies [85022e1]
- Updated dependencies [3c48120]
  - @penumbra-zone/perspective@52.0.0
  - @penumbra-zone/types@32.1.0

## 13.16.0

### Minor Changes

- b430e10: Implement `LiquidityTournamentVoteAction` ActionView component

## 13.15.0

### Minor Changes

- 4adb7aa: Add Pagination UI component

### Patch Changes

- @penumbra-zone/perspective@51.0.0

## 13.14.0

### Minor Changes

- aaaa775: perspective: update Transaction classification, implement `findRelevantAssets` function
  ui: add `TransactionSummary` components

### Patch Changes

- fb5dcb6: Fix TransactionSummary component by improving transaction rendering related to positions and auctions
- Updated dependencies [15d768f]
- Updated dependencies [aaaa775]
  - @penumbra-zone/protobuf@9.0.0
  - @penumbra-zone/types@32.0.0
  - @penumbra-zone/perspective@50.0.0
  - @penumbra-zone/bech32m@15.0.0
  - @penumbra-zone/getters@25.0.0

## 13.13.0

### Minor Changes

- d0cc2ee: Implement `SwapClaim` action view
- c286c09: Implement ActionViews related to positions

### Patch Changes

- Updated dependencies [d0cc2ee]
  - @penumbra-zone/getters@24.1.0
  - @penumbra-zone/types@31.0.0

## 13.12.0

### Minor Changes

- 49ae3ab: LQT integration in web packages
- 07aa2fe: Implement ActionView component
- 28e2ccb: Create new `SegmentedControl` UI component

### Patch Changes

- Updated dependencies [49ae3ab]
  - @penumbra-zone/protobuf@8.0.0
  - @penumbra-zone/types@30.0.0
  - @penumbra-zone/bech32m@14.0.0
  - @penumbra-zone/getters@24.0.0

## 13.11.0

### Minor Changes

- a6094b6: Change tabProps prop type

## 13.10.0

### Minor Changes

- 8f89abd: Make Tabs component extensible

## 13.9.4

### Patch Changes

- Updated dependencies [e51bc61]
  - @penumbra-zone/types@29.1.0

## 13.9.3

### Patch Changes

- Updated dependencies [68b8f36]
  - @penumbra-zone/protobuf@7.2.0
  - @penumbra-zone/bech32m@13.0.0
  - @penumbra-zone/getters@23.0.0
  - @penumbra-zone/types@29.0.0

## 13.9.2

### Patch Changes

- Updated dependencies [6869c52]
- Updated dependencies [29dd11a]
  - @penumbra-zone/types@28.0.0
  - @penumbra-zone/protobuf@7.1.0
  - @penumbra-zone/bech32m@12.0.0
  - @penumbra-zone/getters@22.0.0

## 13.9.1

### Patch Changes

- f3ee52a: Stop XL screen size responsiveness

## 13.9.0

### Minor Changes

- 62eff53: - Make Typography font sizes responsive
  - Add `bodyTechnical` Text variant
  - Add Skeleton component
- cab203e: Add `TableCell` UI component

## 13.8.1

### Patch Changes

- e754ce4: Update Tooltip message prop to support ReactNode

## 13.8.0

### Minor Changes

- 8b4e31e: Updates for Positions Table

### Patch Changes

- Updated dependencies [ebc58d2]
  - @penumbra-zone/types@27.1.0

## 13.7.1

### Patch Changes

- Updated dependencies [95d5fd9]
  - @penumbra-zone/protobuf@7.0.0
  - @penumbra-zone/bech32m@11.0.0
  - @penumbra-zone/types@27.0.0
  - @penumbra-zone/getters@21.0.0

## 13.7.0

### Minor Changes

- 6f74253: Add trailingZeros option to ValueView

### Patch Changes

- Updated dependencies [d619836]
  - @penumbra-zone/types@26.4.0

## 13.6.0

### Minor Changes

- 7969f77: Sync TextInput with the latest designs

## 13.5.0

### Minor Changes

- 7af1ec8: Update Address View component to match the latest designs
- be8b50c: Update Button component to match the latest designs

## 13.4.2

### Patch Changes

- Updated dependencies [712e7b1]
  - @penumbra-zone/types@26.3.0

## 13.4.1

### Patch Changes

- dd2bc86: Controller Slider

## 13.4.0

### Minor Changes

- ebc9f59: Only display tab outline when focused via keyboard, not otherwise.

### Patch Changes

- 5cf7c55: showValue prop for ValueViewComponent to display amounts

## 13.3.1

### Patch Changes

- Updated dependencies [838de8a]
  - @penumbra-zone/types@26.2.1

## 13.3.0

### Minor Changes

- 291bc7d: Updating ValueViewComponent to support shortening symbols

### Patch Changes

- Updated dependencies [291bc7d]
  - @penumbra-zone/types@26.2.0

## 13.2.0

### Minor Changes

- bf2e541: - Add Toggle UI component
  - Add `medium` density
  - Add `xxs` Text style
  - Improve the styles of `Tabs` component

## 13.1.1

### Patch Changes

- 95a22f0: Update Toast description prop

## 13.1.0

### Minor Changes

- ed23c18: Add Slider component

## 13.0.0

### Major Changes

- 1b8a2a1: Refactor UI package from css-in-js to Tailwind
