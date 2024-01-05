import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  // Clear anything rendered by jsdom.
  cleanup();
});
