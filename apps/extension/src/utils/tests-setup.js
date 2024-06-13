import { vi } from 'vitest';
import withResolvers from 'promise.withresolvers';

withResolvers.shim();

// chrome.storage persistence middleware is run upon importing from `state/index.ts`.
// For tests, this is problematic as it uses globals. This mocks those out.
global.chrome = {
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
  runtime: {
    connect: vi.fn().mockReturnValue({
      onMessage: {
        addListener: vi.fn(),
      },
      onDisconnect: {
        addListener: vi.fn(),
      },
    }),
  },
};

global.DEFAULT_GRPC_URL = 'https://rpc.example.com/';
global.PRAX = 'thisisnotarealextensionid';
