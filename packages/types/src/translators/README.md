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

## Higher-order functions

Some "translators" are actually higher-order functions (HOFs) that _return_ translators. This is a useful pattern for when a translator needs access to additional variables besides the translatable object.

For example, the `asReceiverOutputView` translator is an HOF that takes an async `isControlledAddress` helper and returns a translator that now has that helper in scope and can use it to properly construct a return value.
