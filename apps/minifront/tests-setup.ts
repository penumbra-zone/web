import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

vi.mock('zustand');

vi.mock('@penumbra-zone/client');

vi.mock('./src/penumbra', async () => {
  const { createPromiseClient } =
    await vi.importActual<typeof import('@connectrpc/connect')>('@connectrpc/connect');
  return {
    penumbra: {
      service: vi.fn(s => createPromiseClient(s, { unary: vi.fn(), stream: vi.fn() })),
    },
  };
});

afterEach(() => {
  // Clear anything rendered by jsdom. (Without this, previous tests can leave
  // React nodes in the DOM, which can interfere with subsequent tests.)
  cleanup();
});
