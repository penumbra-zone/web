# State management

## Web extension

The extension has three types of state:

### In-memory state

We use [Zustand](https://github.com/pmndrs/zustand) for this. It is based on simplified flux principles and is similar to Redux.
We chose Zustand given its minimalistic, no-boilerplate, hooks-integrated approach. We use `immer` middleware for easier state mutations.

Can be found here: [apps/extension/src/state/](../apps/extension/src/state/). See examples in that folder on how to create your own slice and add to the store.

On refresh, this state is wiped and only the persisted state [apps/extension/src/state/persist.ts](../apps/extension/src/state/persist.ts) is rehyrated.

Be sure to test store functionality! Example using `vitest` here: [apps/extension/src/state/password.test.ts](../apps/extension/src/state/password.test.ts).

### Session state

Meant to be used for short-term persisted data. Holds data in memory for the duration of a browser session.

Sourced from `chrome.storage.session`. Some helpers fns:

- Clear all state: `chrome.storage.session.clear()`
- See all state: `chrome.storage.session.get().then(console.log)`

See `apps/extension/src/state/password.ts` for an example of how to do typesafe storage that is synced with Zustand.
Also, be sure to rehydrate Zustand state here: [apps/extension/src/state/persist.ts](../apps/extension/src/state/persist.ts).

### Local state

Same API as above, except uses `chrome.storage.local`.
Meant to be used for long-term persisted data. It is cleared when the extension is removed.

### Migrations

If your persisted state changes in a breaking way, it's important to write a migration. Steps:

1. Create a new version in the respective storage file. Example: [SessionStorageVersion](../apps/extension/src/storage/session.ts).
2. Write the migration functions. Should have a data structure that looks like:

```typescript
  {
    "seedPhrase": { // storage key
      "V1": (old) => old.split(' ')        // old version: migrate fn
    }
  }
```

3. See [apps/extension/src/storage/migration.test.ts](../apps/extension/src/storage/migration.test.ts) for an example. Make sure you add types to your migration function!
