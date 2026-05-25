#!/bin/bash
# Build multi-threaded WASM with rayon parallelism
#
# This script builds WASM with SharedArrayBuffer support using cargo directly,
# then runs wasm-bindgen to generate JavaScript bindings.
#
# Requirements:
#   - Rust nightly toolchain with rust-src component
#   - wasm-bindgen-cli: cargo install wasm-bindgen-cli
#   - wasm-opt (optional): cargo install wasm-opt
#
# Browser requirements:
#   - SharedArrayBuffer + Atomics support
#   - Server headers:
#     Cross-Origin-Opener-Policy: same-origin
#     Cross-Origin-Embedder-Policy: require-corp

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRATE_DIR="$(dirname "$SCRIPT_DIR")"
# Output to wasm/ to match package.json exports (overwrites single-threaded build)
# Use wasm-parallel/ if you want to keep both builds
OUT_DIR="${OUT_DIR:-${CRATE_DIR}/../wasm}"

echo "Building Multi-threaded WASM with Rayon"
echo "========================================"
echo "Crate directory: $CRATE_DIR"
echo "Output directory: $OUT_DIR"
echo
echo "Requirements:"
echo "  - SharedArrayBuffer + Atomics browser support"
echo "  - Server headers:"
echo "    Cross-Origin-Opener-Policy: same-origin"
echo "    Cross-Origin-Embedder-Policy: require-corp"
echo

# Ensure we're using nightly with rust-src
echo "Checking for nightly toolchain with rust-src..."
if ! rustup run nightly rustc --version &>/dev/null; then
    echo "Installing nightly toolchain..."
    rustup toolchain install nightly
fi

if ! rustup run nightly rustc --print sysroot | xargs -I {} test -d "{}/lib/rustlib/src/rust"; then
    echo "Installing rust-src component for nightly..."
    rustup component add rust-src --toolchain nightly
fi

# Step 1: Build WASM with atomics + SIMD using cargo nightly
echo
echo "Step 1: Building WASM with atomics + bulk-memory + SIMD..."
cd "$CRATE_DIR"
RUSTFLAGS='-C target-feature=+atomics,+bulk-memory,+mutable-globals,+simd128 -C link-arg=--max-memory=4294967296' \
cargo +nightly build \
    --lib \
    --release \
    --target wasm32-unknown-unknown \
    --features parallel \
    -Z build-std=panic_abort,std

echo
echo "WASM binary built successfully"

# Step 2: Run wasm-bindgen
echo
echo "Step 2: Generating JavaScript bindings..."
mkdir -p "$OUT_DIR"

# Handle both workspace and crate-local target directories
WASM_FILE="$CRATE_DIR/target/wasm32-unknown-unknown/release/penumbra_wasm.wasm"
if [ ! -f "$WASM_FILE" ]; then
    # Try workspace root target directory (3 levels up from crate)
    WASM_FILE="$CRATE_DIR/../../../target/wasm32-unknown-unknown/release/penumbra_wasm.wasm"
fi
if [ ! -f "$WASM_FILE" ]; then
    echo "Error: WASM file not found. Searched:"
    echo "  - $CRATE_DIR/target/wasm32-unknown-unknown/release/penumbra_wasm.wasm"
    echo "  - $CRATE_DIR/../../../target/wasm32-unknown-unknown/release/penumbra_wasm.wasm"
    exit 1
fi
echo "Found WASM file: $WASM_FILE"

wasm-bindgen \
    "$WASM_FILE" \
    --out-dir "$OUT_DIR" \
    --out-name index \
    --target web

echo
echo "JavaScript bindings generated"

# Step 3: Run wasm-opt (optional, for size optimization)
if command -v wasm-opt &> /dev/null; then
    echo
    echo "Step 3: Optimizing WASM with wasm-opt..."
    wasm-opt -Oz \
        "$OUT_DIR/index_bg.wasm" \
        -o "$OUT_DIR/index_bg.wasm" \
        --enable-threads --enable-bulk-memory --enable-simd
    echo "WASM optimized"
else
    echo
    echo "wasm-opt not found (skipping optimization)"
    echo "Install with: cargo install wasm-opt"
fi

echo
echo "============================================"
echo "Multi-threaded WASM build complete!"
echo "============================================"
echo
echo "Output files:"
ls -la "$OUT_DIR"/*.{wasm,js} 2>/dev/null || true
echo
echo "WASM size:"
wc -c "$OUT_DIR/index_bg.wasm" | awk '{printf "  %s bytes (%.2f MB)\n", $1, $1/1024/1024}'
echo
echo "Usage in JavaScript:"
echo "  import init, { initThreadPool } from './index.js';"
echo "  await init();"
echo "  await initThreadPool(navigator.hardwareConcurrency || 4);"
echo
