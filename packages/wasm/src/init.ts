/**
 * WASM Module Initialization
 *
 * Standard wasm (wasm/) is built with --target bundler and auto-initializes on import.
 * Parallel wasm (wasm-parallel/) is built with --target web and needs explicit init.
 *
 * Usage:
 *   import { initWasm, initWasmWithParallel } from '@rotko/penumbra-wasm/init';
 *
 *   // For standard builds (no-op, wasm auto-initializes):
 *   await initWasm();
 *
 *   // For parallel builds with rayon (requires SharedArrayBuffer):
 *   await initWasmWithParallel(navigator.hardwareConcurrency);
 */

// Track parallel wasm initialization (standard wasm auto-inits with bundler target)
let parallelWasmInitialized = false;
let parallelWasmInitPromise: Promise<void> | null = null;

/**
 * Check if SharedArrayBuffer is available (required for parallel builds).
 */
export const isParallelSupported = (): boolean => {
  return typeof SharedArrayBuffer !== 'undefined';
};

/**
 * Initialize the WASM module for standard (non-parallel) use.
 * With --target bundler, WASM auto-initializes on import - this is a no-op.
 * Kept for backwards compatibility.
 */
export const initWasm = async (): Promise<void> => {
  // No-op: bundler target auto-initializes WASM on import
  return;
};

/**
 * Initialize the WASM module with rayon parallel support.
 * Requires SharedArrayBuffer to be available.
 *
 * @param numThreads - Number of worker threads to spawn (default: navigator.hardwareConcurrency or 4)
 */
export const initWasmWithParallel = async (
  numThreads: number = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
): Promise<void> => {
  if (parallelWasmInitialized) return;
  if (parallelWasmInitPromise) return parallelWasmInitPromise;

  if (!isParallelSupported()) {
    throw new Error(
      'SharedArrayBuffer is not available. Parallel WASM requires cross-origin isolation or Chrome extension context.',
    );
  }

  parallelWasmInitPromise = (async () => {
    // Dynamically import parallel WASM module
    const parallelWasm = await import('../wasm-parallel/index.js');

    // Create shared memory for rayon threads
    // Initial: 512 pages (32MB), max: 65536 pages (4GB)
    // Note: maximum must match the WASM module's declared maximum (set via --max-memory linker flag)
    const memory = new WebAssembly.Memory({
      initial: 512,
      maximum: 65536,
      shared: true,
    });

    // Initialize the parallel WASM module with shared memory
    await parallelWasm.default({ memory });

    // Initialize the rayon thread pool
    await parallelWasm.initThreadPool(numThreads);

    parallelWasmInitialized = true;
    console.log(`[WASM] Initialized with ${numThreads} parallel threads`);
  })();

  return parallelWasmInitPromise;
};

/**
 * Check if parallel WASM module has been initialized.
 */
export const isWasmInitialized = (): boolean => true; // Standard wasm always auto-inits

/**
 * Check if parallel WASM is initialized.
 */
export const isParallelWasmInitialized = (): boolean => parallelWasmInitialized;

/**
 * Ensure WASM is initialized, initializing with parallel support if available.
 * This is a convenience function that auto-detects the best mode.
 */
export const ensureWasmReady = async (): Promise<boolean> => {
  // Standard wasm auto-initializes with bundler target
  if (isParallelSupported() && !parallelWasmInitialized) {
    await initWasmWithParallel();
    return true;
  }
  return false;
};
