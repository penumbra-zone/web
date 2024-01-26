# Translators

This directory contains translators: pure functions that translate an object into a different object.

## Organization

Files are named and organized by the type of **input** that the translator accepts, not by the type of **output** that the translator returns. For example, a file with `TransactionPlan` -> `Transaction` and `TransactionPlan` -> `TransactionView` translators should be in `transaction-plan.ts`.

## Naming

Translator functions should start with the word `as` and end with the type which they are returning. For example, a translator that takes a `MemoView` and returns an opaque `MemoView` should be called `asOpaqueMemoView`. That will prevent naming collisions and make each function's purpose clearer when you're importing multiple translators at once:

```TS
import { asOpaqueAddressView, asOpaqueMemoView } from '@penumbra-zone/types';
```

## Delegation

Translators should be as simple as possible, delegating to other translators for nested object types. For example, the `asPublicTransactionView` translator doesn't itself modify a transaction view's nested memo view; rather, it delegates that work to `asOpaqueMemoView`. This way, each translator is easy to understand, and easy to test.

## Contexts

Some translators require context beyond the object they're translating. For example, the `asReceiverOutputView` translator requires an asynchronous `isControlledAddress` function that it can call with the output's address to determine whether to render the address as opaque or visible.

In that case, you can define a `CtxType` as the third generic type argument to `Translator` with a key/value pair of context values to pass to that translator. (Even if you only have one context value to pass, a key/value pair is still required, to give the value a name and thus make it clear what its purpose is.)
