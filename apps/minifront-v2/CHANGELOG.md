# minifront-v2

## 7.2.0

### Minor Changes

- d170339: Implement comprehensive staking page for minifront-v2

  - Add complete delegation management with validator selection and amount input
  - Implement responsive staking assets overview with account-reactive balance display
  - Add delegation tokens section with proper validator info parsing and ValueView integration
  - Minimalistic transaction UX via Button content & auto-closing dialog (Toast component integration tbd)
  - Enhanced unbonding token formatting for Assetcard on Portfolio Page

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

### Patch Changes

- Updated dependencies [d170339]
- Updated dependencies [a05953a]
- Updated dependencies [a6b95be]
  - @penumbra-zone/ui@16.0.4

## 7.1.3

### Patch Changes

- 4657582: import `BigNumber` correctly
- Updated dependencies [4657582]
  - @penumbra-zone/types@36.0.0
  - @penumbra-zone/ui-deprecated@22.0.2
  - @penumbra-zone/crypto-web@48.0.0
  - @penumbra-zone/ui@16.0.3
  - @penumbra-zone/perspective@61.1.1

## 7.1.2

### Patch Changes

- Updated dependencies [cca1b0f]
  - @penumbra-zone/perspective@61.1.0
  - @penumbra-zone/ui@16.0.2
  - @penumbra-zone/ui-deprecated@22.0.1

## 7.1.1

### Patch Changes

- Updated dependencies [bdb700d]
- Updated dependencies [cda1a99]
- Updated dependencies [f1e701a]
  - @penumbra-zone/types@35.0.0
  - @penumbra-zone/ui@16.0.1
  - @penumbra-zone/protobuf@11.0.0
  - @penumbra-zone/crypto-web@47.0.0
  - @penumbra-zone/ui-deprecated@22.0.0
  - @penumbra-zone/bech32m@18.0.0
  - @penumbra-zone/client@29.0.0
  - @penumbra-zone/getters@28.0.0
  - @penumbra-zone/perspective@61.0.0

## 7.1.0

### Minor Changes

- f529714: Completing the tailwind-v4 ugprade within minifront-v2. Previous in-complete upgrade broke the app and required minor adaptions.
- d3b1d78: feat: establish minifront-v2 app with Transactions UI and Transfer Page

### Patch Changes

- Updated dependencies [ad72bd1]
- Updated dependencies [82700e9]
- Updated dependencies [54543d9]
- Updated dependencies [23d578b]
- Updated dependencies [9658941]
- Updated dependencies [14a8ccd]
- Updated dependencies [a42b5c2]
- Updated dependencies [d3b1d78]
- Updated dependencies [044daa9]
  - @penumbra-zone/ui@16.0.0
  - @penumbra-zone/ui-deprecated@21.1.0

## 7.0.3

### Patch Changes

- Updated dependencies [82d034e]
  - @penumbra-zone/bech32m@17.0.1
  - @penumbra-zone/client@28.1.1
  - @penumbra-zone/crypto-web@46.0.1
  - @penumbra-zone/getters@27.0.1
  - @penumbra-zone/perspective@60.0.1
  - @penumbra-zone/protobuf@10.1.1
  - @penumbra-zone/transport-dom@7.5.2
  - @penumbra-zone/types@34.2.1
  - @penumbra-zone/ui@15.0.2

## 7.0.2

### Patch Changes

- Updated dependencies [c770cd5]
- Updated dependencies [91eb242]
  - @penumbra-zone/ui@15.0.1
  - @penumbra-zone/client@28.1.0

## 7.0.1

### Patch Changes

- Updated dependencies [dcfbe8a]
- Updated dependencies [78e36b8]
- Updated dependencies [78e36b8]
- Updated dependencies [dcfbe8a]
- Updated dependencies [2066c86]
  - @penumbra-zone/ui@15.0.0
  - @penumbra-zone/perspective@60.0.0
