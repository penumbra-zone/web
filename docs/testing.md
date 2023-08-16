# Testing

Writing tests should be a natural part of every pull request. We are not measuring
test coverage at the moment, but we should still strive to cover as
much as we can. If we do, our app will be far more resilient to changes.

Different kinds of testing examples:
- Unit tests: [packages/crypto/src/encryption.test.ts](../packages/crypto/src/encryption.test.ts)
- Zustand store tests: [apps/extension/src/state/password.test.ts](../apps/extension/src/state/password.test.ts)
- Snapshot tests: TBD


### Vitest

[Vitest](https://vitest.dev/) is a jest-compatible testing framework with extra features built in that go beyond Jest.


