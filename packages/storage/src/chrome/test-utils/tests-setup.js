import { vi } from 'vitest';

// chrome.storage persistence middleware is run upon importing from `state/index.ts`.
// For tests, this is problematic as it uses globals. This mocks those out.
globalThis.chrome = {
  storage: {
    onChanged: {
      addListener: vi.fn(),
    },

    local: {
      set: vi.fn(),
      get: vi.fn().mockReturnValue({}),
      remove: vi.fn(),
    },
    session: {
      set: vi.fn(),
      get: vi.fn().mockReturnValue({}),
      remove: vi.fn(),
    },
  },
};

globalThis.DEFAULT_GRPC_URL = 'https://rpc.example.com/';
