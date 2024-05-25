# Getters

**To use this package, you need to [enable the Buf Schema Registry](https://buf.build/docs/bsr/generated-sdks/npm)**

```sh
echo "@buf:registry=https://buf.build/gen/npm/v1/" >> .npmrc
```

Getters were designed to solve a common pain point when working with deserialized Protobuf messages: accessing deeply nested, often optional properties.

For example, let's say you have an `AddressView`, and you want to render an `AddressIndex`. You'd need render it conditionally, like so:

```tsx
<div>
  {addressView.addressView.case === 'decoded' && addressView.addressView.value.index?.account && (
    <span>{addressView.addressView.value.index.account}</span>
  )}
</div>
```

Not very readable, and pretty annoying to type. But it can get even worse! Imagine you now have a `MemoView`, which _optionally contains_ an `AddressView`. You still want to render an `AddressIndex`. So you'd render it with even more conditions, like so:

```tsx
<div>
  {memoView.memoView.case === 'visible' &&
    memoView.memoView.value.plaintext?.returnAddress.addressView.case === 'decoded' &&
    memoView.memoView.value.plaintext.returnAddress.addressView.value.index?.account && (
      <span>{addressView.addressView.value.index.account}</span>
    )}
</div>
```

This quickly gets pretty cumbersome. You could, of course, throw a bunch of type guards at the top of your component to simplify your markup:

```tsx
if (memoView.memoView.case !== 'visible') throw new Error()
if (memoView.memoView.value.plaintext?.returnAddress.addressView.case !== 'decoded') throw new Error()
if (typeof memoView.memoView.value.plaintext.returnAddress.addressView.value.index?.account === 'undefined') throw new Error()

<div>
  <span>{addressView.addressView.value.index.account}</span>
</div>
```

This works, but you still have a bunch of boilerplate code crowding your component.

Getters solve all that. Getters are tiny, composable functions, inspired by the functional programming [lens pattern](https://www.bekk.christmas/post/2019/6/the-lens-pattern-in-typescript), that allow you to get at deeply nested, often optional properties without all the boilerplate.

Let's solve the above problem with getters. First, let's create a getter that, when given a `MemoView`, returns its `AddressView`:

```ts
const getAddressView = createGetter((memoView?: MemoView) =>
  memoView.memoView.case === 'visible' ? memoView.memoView.plaintext?.returnAddress : undefined,
);
```

`getAddressView()` is now a simple function that can be called with a `MemoView`, like this: `getAddressView(memoView)`. It will then return the `AddressView`, or throw if it's `undefined`.

OK, next, let's create another getter that, when given an `AddressView`, returns its `AddressIndex`:

```ts
const getAddressIndex = createGetter((addressView?: AddressView) =>
  addressView?.addressView.case === 'decoded' ? addressView.addressView.value.index : undefined,
);
```

Again, `getAddressIndex()` is a simple function that can be called with an `AddressView`, like this: `getAddressIndex(addressView)`. It will then return the `AddressIndex`, or throw if it's `undefined`.

Since we defined these two functions with `createGetter()`, though, they have a `pipe` method that let us chain them together. That way, we can easily create a getter that, when given a `MemoView`, will return an `AddressIndex`:

```ts
const getAddressIndexFromMemoView = getAddressView.pipe(getAddressIndex);
```

OK, now we can quickly clean up our component code:

```tsx
<div>
  <span>{getAddressIndexFromMemoView(memoView)}</span>
</div>
```

Way better!

At this point, it's worth mentioning that getters are _required by default_. If any step along the getter chain above returns `undefined`, they will throw a `GetterMissingValueError`.

(It might seem unintuitive that getter functions are required, but are defined with an _optional_ argument -- e.g., `createGetter((addressView?: AddressView) => ... )`. Without that optionality, you'd get a TypeScript complaint like `Type 'undefined' is not assignable to type 'AddressView'.` Getters assume that they can be passed `undefined`; otherwise, TypeScript would make `pipe()`ing impossible, since deeply nested properties are often optional. Don't worry, though: `createGetter` ensures that your getters still throw if they get `undefined`, which is what guarantees type safety.)

What if the value you're getting _is_ optional, though? What if you don't want your getter to throw if either the value it's passed, or the value it returns, is `undefined`? That's what the `.optional()` property on the getter is for:

```tsx
const addressView = getAddressView.optional()(memoView)

<div>
  {addressView && <AddressViewComponent addressView={addressView} />}
</div>
```

Or, if you want to chain multiple getters together and make the whole chain optional, call `.optional()` on the _first_ getter in the chain (which will then mark the rest of the chain as optional, too):

```tsx
const getAddressIndexFromMemoView = getAddressView.optional().pipe(getAddressIndex);
const addressIndex = getAddressIndexFromMemoView(memoView)

<div>
  {addressIndex && <AddressIndex addressIndex={addressIndex} />}
</div>
```
