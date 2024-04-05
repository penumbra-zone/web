# Debugging

### SCT Divergence

Our [block processor](../packages/query/src/block-processor.ts) does the job of querying blocks and assembling
a filtered portion of the [state-commitment-tree](https://protocol.penumbra.zone/main/sct.html). This is
then used for the user's transactions, on the client forming zk proofs that their commitment is included in this tree.
If our code assembles this tree incorrectly (in wasm, in our database, in our block processor, etc). The user will
be met with an error like:

```
failed to deliver transaction: check_stateful failed:
provided anchor 602a5492caad089c2443c8e264ce87b08a652979f5e93d944293f4adb08a6908 is not a valid SCT root
```

This is a programmer error, so we need to do a full audit of the surfaces that influence the SCT handling:

- rust/wasm
- indexed db
- block processor

To assist with this, we should validate the SCT root of each block to see where the divergence takes place.
The `assertRootValid` function in our [block processor](../packages/query/src/block-processor.ts) can assist.
This slows down block syncing significantly, so it's only used for debugging.

Enable it by entering `globalThis.ASSERT_ROOT_VALID = true` in the service worker
console: [VIDEO DEMO](https://github.com/penumbra-zone/web/assets/16624263/c0596976-bc1f-45f9-8bc6-a84e7aaec7fa)
