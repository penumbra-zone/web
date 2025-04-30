# Penumbra Web Monorepo

This is a monorepo for Penumbra web applications and libraries, managed with Turborepo and pnpm.

## Project Structure

- **apps/** - Frontend applications
  - **minifront/** - Main Penumbra dApp
  - **node-status/** - Node status monitoring dashboard
  - **veil/** - Specialized application
- **packages/** - Shared libraries and utilities
  - **ui/** - New UI component library
  - **ui-deprecated/** - Legacy UI components (to be migrated)
  - **getters/** - Data retrieval utilities
  - **protobuf/** - Protocol Buffer definitions
  - **types/** - Type definitions
  - **bech32m/** - Bech32m encoding utilities
  - **perspective/** - View-specific utilities
  - **crypto/** - Cryptography utilities
  - **wasm/** - WebAssembly modules

## UI Library Migration

We are currently upgrading our UI components from the deprecated library to a new implementation based on Figma designs.

### Migration Strategy

1. New components are being developed in `packages/ui`
2. Some v2 components have been implemented in `apps/minifront/src/components/v2`
3. We must maintain backward compatibility during the migration

### Component Architecture

The Penumbra UI library follows these key principles:

- **Density Context**: Components adapt to `sparse` or `compact` layouts via the `<Density />` context
- **Boolean Properties**: Many components use boolean props for variant control
- **Action Types**: Components use `actionType` props ('default', 'accent', 'destructive', etc.) for semantic styling
- **Styling Pattern**: Components do not accept `className` or `style` props directly
- **External Dependencies**: Components often use `@penumbra-zone/getters`, `@penumbra-zone/protobuf`, and `@penumbra-zone/types`
- **Radix UI**: Many components build upon Radix UI primitives

## Development Workflow

### Setup

```bash
pnpm install
```

### Key Commands

```bash
# Start development server for UI package
pnpm dev:pack

# Start development server for minifront app
pnpm --filter minifront dev:app

# Lint code
pnpm lint
pnpm lint:strict

# Format code
pnpm format:prettier

# Run tests
pnpm test

# Create a changeset for versioning
pnpm changeset
```

### Versioning

We use `pnpm changeset` for version management. Always create a changeset when making changes to packages:

```bash
pnpm changeset
```

This will prompt you to:

1. Select which packages have changed
2. Choose a version increment type (patch, minor, major)
3. Write a description of the changes

## UI Development Guidelines

When working on UI components:

1. **Study Existing Components**: Review similar components in `packages/ui/src` to understand patterns
2. **Maintain File Structure**:
   - Component file in `ComponentName/index.tsx`
   - Storybook file in `ComponentName/index.stories.tsx`
3. **Use Contextual Styling**:
   - Components should respect the `Density` context
   - Style based on semantic props like `actionType` and `priority`
4. **Follow Naming Conventions**:
   - Export component props as `ComponentNameProps`
   - For Protobuf types, suffix components with `Component` (e.g., `ValueViewComponent`)
5. **Document Thoroughly**:
   - Add JSDoc comments for props
   - Create Storybook stories tagged with appropriate categories
6. **Testing**:
   - Write unit tests for component logic

## Cursor Rules

- Always use pnpm as the package manager
- Follow the component architecture patterns from existing components
- Maintain backward compatibility during migration
- Create changesets for version updates
- Use the Density context for layout control
- Test components thoroughly before integration

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
- [Install Node.js](https://nodejs.org/en/download/package-manager) however you like (at least version 20.18.0)
- [Install pnpm](https://pnpm.io/installation) (probably via corepack; at least version 9)
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
