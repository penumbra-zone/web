# Penumbra Web

The [Penumbra](https://penumbra.zone/) monorepo for all things web.

![ci status](https://github.com/penumbra-zone/web/actions/workflows/turbo-ci.yml/badge.svg?branch=main)

This is a monolithic repository of Penumbra web code, a monorepo. Multiple apps,
internal packages, and published packages are developed in this repository, to
simplify work and make broad cross-package changes more feasible.

To participate in the test network, use the browser extension
[Prax](https://chrome.google.com/webstore/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe)
from the Chrome Web Store.

You can talk to us on [Discord](https://discord.gg/hKvkrqa3zC).

## You might be looking for examples

### [`@penumbra-zone/client` nextjs example](https://github.com/penumbra-zone/nextjs-penumbra-client-example)

### [`@penumbra-zone/wasm` nextjs example](https://github.com/penumbra-zone/nextjs-penumbra-wasm-example)

## What's in here

### [Minifront](https://app.testnet.penumbra.zone/): Dapp to swap, stake, and send on the Penumbra testnet.

### [Prax](https://chrome.google.com/webstore/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe): Extension for Chrome that provides key custody, manages chain activity, and hosts services used by dapps.

### [Status](https://grpc.testnet.penumbra.zone/): Public info dashboard for Penumbra nodes.

### Published Packages

All have a `@penumbra-zone/` namespace prefix on npm.

**🌘
[bech32m](https://www.npmjs.com/package/@penumbra-zone/bech32m) 🌑
[client](https://www.npmjs.com/package/@penumbra-zone/client) 🌑
[constants](https://www.npmjs.com/package/@penumbra-zone/constants) 🌑
[crypto](https://www.npmjs.com/package/@penumbra-zone/crypto) 🌑
[getters](https://www.npmjs.com/package/@penumbra-zone/getters) 🌑
[keys](https://www.npmjs.com/package/@penumbra-zone/keys) 🌑
[perspective](https://www.npmjs.com/package/@penumbra-zone/perspective) 🌑
[protobuf](https://www.npmjs.com/package/@penumbra-zone/protobuf) 🌑
[services](https://www.npmjs.com/package/@penumbra-zone/services) 🌑
[services-context](https://www.npmjs.com/package/@penumbra-zone/services-context) 🌑
[storage](https://www.npmjs.com/package/@penumbra-zone/storage) 🌑
[transport-chrome](https://www.npmjs.com/package/@penumbra-zone/transport-chrome) 🌑
[transport-dom](https://www.npmjs.com/package/@penumbra-zone/transport-dom) 🌑
[types](https://www.npmjs.com/package/@penumbra-zone/types) 🌑
[wasm](https://www.npmjs.com/package/@penumbra-zone/wasm)
🌒**

## Documentation

General documentation is available in [docs/README.md](docs/README.md). Package-specific documentation is available in each respective package.

## Getting Started

### Prerequisites

- [Install Rust and Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) (probably with rustup)
- [Install Node.js](https://nodejs.org/en/download/package-manager) however you like (at least version 20)
- [Install pnpm](https://pnpm.io/installation) (probably via corepack)
- Install Google Chrome

### Building

Once you have all these tools, you can

```sh
git clone https://github.com/penumbra-zone/web
cd web
pnpm i
pnpm dev
```

You now have a local copy of Minifront available at
[`https://localhost:5173`](https://localhost:5173) and an unbundled Prax is
available at [`apps/extension/dist`](apps/extension/dist), ready to be loaded
into your browser.

Minifront will hot-reload.

If you're working on Prax, Chrome will show extension page changes after a
manual refresh, but cannot reload the extension worker scripts or content
scripts. For worker script changes, you must manually reload the extension. For
content script changes, you must also manually reload pages hosting the injected
scripts.

#### Loading your unbundled build of Prax into Chrome

After building Prax, you can load it into Chrome.

It's recommended to use a dedicated browser profile for development, not your
personal profile.

1. Go to the Extensions page [`chrome://extensions`](chrome://extensions)
2. Enable _Developer Mode_ by clicking the toggle switch at the top right
3. Click the button _Load unpacked extension_ at the top and locate your cloned
   repository. Select the extension's build output directory
   [`apps/extension/dist`](../apps/extension/dist).
4. Activate the extension to enter onboarding.
   - You may set a blank password.
   - You can pin the Prax extension button to your toolbar for quick access.
