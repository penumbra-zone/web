---
'@penumbra-zone/transport-chrome': patch
'@penumbra-zone/transport-dom': patch
---

disable unsupported client-streaming requests. if you are experimenting with
development of client-streaming requests, define the `globalThis.__DEV__` flag
in your bundler to enable them.
