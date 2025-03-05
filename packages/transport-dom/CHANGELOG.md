# @penumbra-zone/transport-dom

## 7.5.1

### Patch Changes

- 521caaa: convey timeout in request headers
- a51a752: disable unsupported client-streaming requests. if you are experimenting with
  development of client-streaming requests, define the `globalThis.__DEV__` flag
  in your bundler to enable them.
- 521caaa: exclude non-transferable type member from internal message types
- ca71c02: added tests (no external change)
- a11bfe3: response streams will now respect the request's timeout configuration.

## 7.5.0

### Minor Changes

- 10ef940: Updating to v0.80.0 bufbuild types

## 7.4.0

### Minor Changes

- a788eff: Update default timeouts to better support build times

## 7.3.0

### Minor Changes

- af04e2a: respect transport abort controls

## 7.2.2

### Patch Changes

- e65e36b: use Transport type for createChannelTransport return

## 7.2.1

### Patch Changes

- 3708e2c: include peer deps as dev deps

## 7.2.0

### Minor Changes

- 47c6bc0: support disconnection

## 7.1.0

### Minor Changes

- 9b3f561: properly build esm relative paths

## 7.0.0

### Major Changes

- f067fab: reconfigure all package builds

## 6.0.0

### Major Changes

- 8fe4de6: correct ordering of default export

## 5.0.0

### Major Changes

- 8b121ec: change package exports to use 'default' field

## 4.1.0

### Minor Changes

- 3ea1e6c: update buf types dependencies

## 4.0.0

### Major Changes

- fc500af: correctly build transport-dom

## 3.0.0

### Major Changes

- 3148375: remove `/src/` path segment from exports

## 2.0.0

### Major Changes

- 929d278: barrel imports to facilitate better tree shaking

## 1.1.0

### Minor Changes

- Initial changest. Git tag v5.0.0 updates.
