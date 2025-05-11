# @penumbra-zone/transport-chrome

## 9.0.0

### Major Changes

- de2fe5c: significant updates to sessions:

  - improvement of session-client
  - session-client can now be terminated by static method
  - improvement of session-manager
  - individual session logic now encapsulated in dedicated class
  - session-manager killOrigin returns set of senders
  - session-manager now primarily concerned with port lifecycles

### Minor Changes

- de2fe5c: Transport session reliability improvements.

  - No external API change.
  - Remove singleton restriction of `CRSessionClient`.
  - Don't retain port reference to respect object transfer rules.

### Patch Changes

- 3827b67: improve and document stream implementation. no external change
- de2fe5c: avoid global session timeouts
- 987547a: improved tests, no external change

## 8.0.2

### Patch Changes

- a51a752: disable unsupported client-streaming requests. if you are experimenting with
  development of client-streaming requests, define the `globalThis.__DEV__` flag
  in your bundler to enable them.
- ca71c02: added tests (no external change)
- Updated dependencies [521caaa]
- Updated dependencies [a51a752]
- Updated dependencies [521caaa]
- Updated dependencies [ca71c02]
- Updated dependencies [a11bfe3]
  - @penumbra-zone/transport-dom@7.5.1

## 8.0.1

### Patch Changes

- df2ac99: Use newer client package for minifront. Fix disconnect in transport-chrome

## 8.0.0

### Minor Changes

- 10ef940: Updating to v0.80.0 bufbuild types

### Patch Changes

- Updated dependencies [10ef940]
  - @penumbra-zone/transport-dom@7.5.0

## 7.0.1

### Patch Changes

- 06aa65d: Allow http://localhost to establish the connection with chrome extensions

## 7.0.0

### Minor Changes

- a788eff: Update default timeouts to better support build times

### Patch Changes

- Updated dependencies [a788eff]
  - @penumbra-zone/transport-dom@7.4.0

## 6.0.0

### Minor Changes

- af04e2a: respect transport abort controls

### Patch Changes

- Updated dependencies [af04e2a]
  - @penumbra-zone/transport-dom@7.3.0

## 5.0.3

### Patch Changes

- 3aaead1: Move the "default" option in package.json exports field to the last

## 5.0.2

### Patch Changes

- Updated dependencies [e65e36b]
  - @penumbra-zone/transport-dom@7.2.2

## 5.0.1

### Patch Changes

- 3708e2c: include peer deps as dev deps
- Updated dependencies [3708e2c]
  - @penumbra-zone/transport-dom@7.2.1

## 5.0.0

### Minor Changes

- 47c6bc0: support disconnection

### Patch Changes

- Updated dependencies [47c6bc0]
  - @penumbra-zone/transport-dom@7.2.0

## 4.0.0

### Minor Changes

- 9b3f561: properly build esm relative paths

### Patch Changes

- Updated dependencies [9b3f561]
  - @penumbra-zone/transport-dom@7.1.0

## 3.0.0

### Major Changes

- f067fab: reconfigure all package builds

### Patch Changes

- Updated dependencies [f067fab]
  - @penumbra-zone/transport-dom@7.0.0

## 2.2.2

### Patch Changes

- Updated dependencies [8fe4de6]
  - @penumbra-zone/transport-dom@6.0.0

## 2.2.1

### Patch Changes

- Updated dependencies [8b121ec]
  - @penumbra-zone/transport-dom@5.0.0

## 2.2.0

### Minor Changes

- 3ea1e6c: update buf types dependencies

### Patch Changes

- Updated dependencies [3ea1e6c]
  - @penumbra-zone/transport-dom@4.1.0

## 2.1.2

### Patch Changes

- Updated dependencies [fc500af]
  - @penumbra-zone/transport-dom@4.0.0

## 2.1.1

### Patch Changes

- Updated dependencies [3148375]
  - @penumbra-zone/transport-dom@3.0.0

## 2.1.0

### Minor Changes

- 13d0bc5:

## 2.0.0

### Major Changes

- 929d278: barrel imports to facilitate better tree shaking

### Patch Changes

- Updated dependencies [929d278]
  - @penumbra-zone/transport-dom@2.0.0

## 1.0.1

### Patch Changes

- Updated dependencies
  - @penumbra-zone/transport-dom@1.1.0
