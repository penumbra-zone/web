---
'minifront': minor
'@repo/ui': patch
---

Minifront:

- extend `BalanceSelector` to show not only assets with balances but all available assets
- fix the issues with empty wallets not rendering a swap block correctly
- reduce the height of `BalanceSelecor` and `AssetSelector` to `90dvh`
- autofocus the search inputs in `BalanceSelecor` and `AssetSelector`
- change validations of the swap input to allow entering any possible values

UI: allow passing HTML attributes to the `IconInput` component
