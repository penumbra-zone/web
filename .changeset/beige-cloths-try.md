---
'@penumbra-zone/wasm': major
'@penumbra-zone/services': patch
---

Make the view service request for mapping indices to addresses take the randomizer into account.

The WASM package has a breaking change in that the `get_address_by_index` function now
_requires_ you to pass a randomizer.
This can be an empty slice, indicating a randomizer consistent of all 0s.
Clients should upgrade by adding a `&[]` parameter, which will preserve their current behavior.
