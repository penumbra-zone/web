#!/bin/sh

# pnpm doesn't like to recurse for the pack command, and turbo doesn't
# understand it as a script.  this script should pack every non-private package
pnpm turbo compile
pnpm turbo build
pnpm pack -C packages/bech32m
pnpm pack -C packages/client
pnpm pack -C packages/crypto
pnpm pack -C packages/getters
pnpm pack -C packages/keys
pnpm pack -C packages/perspective
pnpm pack -C packages/protobuf
pnpm pack -C packages/query
pnpm pack -C packages/services
pnpm pack -C packages/storage
pnpm pack -C packages/transport-chrome
pnpm pack -C packages/transport-dom
pnpm pack -C packages/types
pnpm pack -C packages/wasm
