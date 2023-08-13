import { vi } from 'vitest';

global.chrome = {
  storage: {
    local: {
      set: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
    },
    session: {
      set: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
    },
  },
};

// beforeAll(() => {
//   global.chrome = {
//     storage: {
//       local: {},
//       session: {},
//     },
//   };
// });
// afterAll(() => {
//   delete global.chrome;
// });
