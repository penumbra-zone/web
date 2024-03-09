import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import fromAsync from 'array-from-async';
import Array from '@penumbra-zone/polyfills/Array.fromAsync';
import '@testing-library/jest-dom/vitest';

// `Array.fromAsync` exists in Chrome, but not in our JSDom test environment. So
// we have to polyfill it using the official ES shim.
Array.fromAsync = fromAsync;

vi.mock('zustand');

afterEach(() => {
  // Clear anything rendered by jsdom. (Without this, previous tests can leave
  // React nodes in the DOM, which can interfere with subsequent tests.)
  cleanup();
});
