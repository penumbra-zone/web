---
'@penumbra-zone/transport-chrome': minor
---

Transport session reliability improvements.

- No external API change.
- Remove singleton restriction of `CRSessionClient`.
- Don't retain port reference to respect object transfer rules.
