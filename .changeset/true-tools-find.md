---
'minifront-v2': minor
'@penumbra-zone/ui': patch
---

feat(minifront-v2): implement shielding page with deposit/withdraw flows

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