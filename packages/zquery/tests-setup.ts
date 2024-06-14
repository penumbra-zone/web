import withResolvers from 'promise.withresolvers';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

withResolvers.shim();

afterEach(() => {
  // Clear anything rendered by jsdom. (Without this, previous tests can leave
  // React nodes in the DOM, which can interfere with subsequent tests.)
  cleanup();
});
