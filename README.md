# Penumbra Web

The [Penumbra](https://penumbra.zone/) monorepo for all things web.

![ci status](https://github.com/penumbra-zone/web/actions/workflows/turbo-ci.yml/badge.svg?branch=main)

This is a monolithic repository of Penumbra web code, a monorepo. Multiple apps,
internal packages, and published packages are developed in this repository, to
simplify work and make broad cross-package changes more feasible.

To participate in the test network, use a browser extension like
[Prax](https://chrome.google.com/webstore/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe)
from the Chrome Web Store.

You can talk to us on [Discord](https://discord.gg/hKvkrqa3zC).

## You might be looking for examples

### [`@penumbra-zone/client` nextjs example](https://github.com/penumbra-zone/nextjs-penumbra-client-example)

### [`@penumbra-zone/wasm` nextjs example](https://github.com/penumbra-zone/nextjs-penumbra-wasm-example)

## What's in here

### [Minifront](./apps/minifront): Dapp to swap, stake, and send on the Penumbra testnet.

### [Status](./apps/node-status): Public info dashboard for Penumbra nodes.

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
- [Install Wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- Install [cargo-watch](https://crates.io/crates/cargo-watch): `cargo install cargo-watch`
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
[`https://localhost:5173`](https://localhost:5173).

Minifront will hot-reload.

## Security

If you believe you've found a security-related issue with Penumbra,
please disclose responsibly by contacting the Penumbra Labs team at
security@penumbralabs.xyz.
