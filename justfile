# Install npm dependencies
install:
  pnpm install

# Build the apps via turbo
build:
  pnpm turbo build

# Compile the WASM dependencies via turbo
wasm:
  pnpm turbo compile

# Compile the WASM dependencies via turbo (alias)
compile:
  @just wasm

# Remove all cached build artifacts
clean:
  pnpm clean
  pnpm clean:modules
  pnpm clean:vitest-mjs
  rm -rf .turbo
  fd -t d node_modules --no-ignore -X rm -r
  fd -t d target --no-ignore -X rm -r
  fd -t f tsconfig.tsbuildinfo --no-ignore -X rm
  fd -t d flake-inputs --no-ignore --hidden -X rm -r

# Wrapper for all linting targets
lint:
  @just lint-turbo
  @just lint-rust

# Lint the turbo resources
lint-turbo:
  pnpm turbo lint:strict

# List Rust code
lint-rust:
  pnpm turbo lint:rust

# Build top-level debug container
container: clean
  @just veil-container
  podman image ls | rg veil

# Run dev-env for Veil DEX explorer app
veil:
  cd ./apps/veil && just dev

# Build container for Veil app
veil-container:
  cd ./apps/veil && just container

# Configure Playwright for current nix devshell
playwright-setup:
  ./scripts/playwright-setup

# Run all test suites
test: playwright-setup
  # Run rust tests
  @just test-rust
  # Run turbo playwright tests
  @just test-turbo

# Run the turbo test suite
test-turbo: playwright-setup
   pnpm turbo test

# Run the Rust test suite
test-rust: playwright-setup
   pnpm turbo test:cargo
   pnpm turbo test:wasm

# Run test suites locally and gather timing information
benchmark-tests:
  ./scripts/benchmark-tests
