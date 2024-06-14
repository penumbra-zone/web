---
'@penumbra-zone/zquery': major
'minifront': minor
---

Beef up ZQuery's handling of streams; take advantage of it in minifront.

BREAKING CHANGE: The `stream` property passed to `createZQuery()` should now return an object containing at least an `onValue` method. See the docs for the `stream` property for more info.
