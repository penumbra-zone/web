# Install npm dependencies
install:
  pnpm install

# Build the apps via turbo
build: install
  pnpm turbo build --cache-dir=.turbo

# Compile the WASM dependencies via turbo
wasm: install
  pnpm turbo compile --cache-dir=.turbo

# Compile the WASM dependencies via turbo (alias)
compile: install
  @just wasm

# Remove all cached build artifacts
clean:
  pnpm clean
  pnpm clean:modules
  pnpm clean:vitest-mjs
  rm -rf .turbo
  fd -t d node_modules --no-ignore -X rm -r
  fd -t d target --no-ignore -X rm -r

# Wrapper for all linting targets
lint:
  @just lint-turbo
  @just lint-rust

# Lint the turbo resources
lint-turbo: install
  pnpm turbo lint:strict --cache-dir=.turbo

# List Rust code
lint-rust: install
  pnpm turbo lint:rust --cache-dir=.turbo

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
test:
  # Run rust tests
  @just test-rust
  # Run turbo playwright tests
  @just test-turbo

# Run the turbo test suite
test-turbo: install
   pnpm turbo test --cache-dir=.turbo

# Run the Rust test suite
test-rust: install
   pnpm turbo test:cargo --cache-dir=.turbo
   pnpm turbo test:wasm --cache-dir=.turbo

# Run test suites locally and gather timing information
benchmark-tests:
  ./scripts/benchmark-tests
