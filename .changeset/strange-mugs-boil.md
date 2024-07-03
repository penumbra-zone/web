---
'@penumbra-zone/zquery': major
'@penumbra-zone/getters': minor
'minifront': minor
---

Update ZQuery to accept selectors; update minifront to take advantage of this feature

ZQuery's `use[Name]()` hooks now accept an optional options object as their first argument, then pass any remaining arguments to the `fetch` function.
