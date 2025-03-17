import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

vi.mock('zustand');

vi.mock('@penumbra-zone/client');

vi.mock('./src/penumbra', async () => {
  return {
    penumbra: {
      service: vi.fn(),
    },
  };
});

afterEach(() => {
  // Clear anything rendered by jsdom. (Without this, previous tests can leave
  // React nodes in the DOM, which can interfere with subsequent tests.)
  cleanup();
});
