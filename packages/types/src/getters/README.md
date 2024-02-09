# Getters

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
const getAddress = createGetter<MemoView, AddressView>(memoView =>
  memoView.memoView.case === 'visible' ? memoView.memoView.plaintext?.returnAddress : undefined,
);
```

`getAddress()` is now a simple function that can be called with a `MemoView`, like this: `getAddress(memoView)`. It will then return the `AddressView` or `undefined`.

OK, next, let's create another getter that, when given an `AddressView`, returns its `AddressIndex`:

```ts
const getAddressIndex = createGetter<AddressView, AddressIndex>(addressView =>
  addressView?.addressView.case === 'decoded' ? addressView.addressView.value.index : undefined,
);
```

Again, `getAddressIndex()` is a simple function that can be called with an `AddressView`, like this: `getAddressIndex(addressView)`. It will then return the `AddressIndex` or `undefined`.

Since we defined these two functions with `createGetter()`, though, they have a `pipe` method that let us chain them together. That way, we can easily create a getter that, when given a `MemoView`, will return an `AddressIndex`:

```ts
const getAddressIndexFromMemoView = getAddress.pipe(getAddressIndex);
```

Thus, we can quickly clean up our component code:

```tsx
<div>
  <span>{getAddressIndexFromMemoView(memoView)}</span>
</div>
```

Already way cleaner! Of course, we can call `.pipe()` inline in our markup, too:

```tsx
<div>
  <span>{getAddress.pipe(getAddressIndex)(memoView)}</span>
</div>
```

Note, though, that our getter can return `undefined` at any step of the pipe. Perhaps we don't want that -- perhaps we want to assert that the value _has_ to be there. In that case, we can append `.orThrow()` to our getter:

```tsx
<div>
  <span>{getAddress.pipe(getAddressIndex).orThrow()(memoView)}</span>
</div>
```

This will throw an error if the getter chain returns `undefined`. If we want it to throw an error with a specific message, we can pass that message as the argument to `.orThrow()`:

```tsx
<div>
  <span>
    {getAddress
      .pipe(getAddressIndex)
      .orThrow('Either the address or the address index is missing!')(memoView)}
  </span>
</div>
```

This might be getting a bit long for our markup, so we can save it to a variable like we were doing before:

```tsx
const getAddressIndexFromMemoView = getAddress.pipe(getAddressIndex).orThrow('Either the address or the address index is missing!');

<div>
  <span>{getAddressIndexFromMemoView(memoView)</span>
</div>
```

Finally, we can customize at which step of the pipe we want to throw in case of `undefined`:

```ts
// Will throw if the address is missing, but not if the address index is
// missing.
const getAddressIndexFromMemoView = getAddress
  .orThrow('The address is missing!')
  .pipe(getAddressIndex);
```

And you can set custom error messages for each step of the pipe:

```ts
// Will throw the first error message if the address is missing, or the second
// if the address index is missing.
const getAddressIndexFromMemoView = getAddress
  .orThrow('The address is missing!')
  .pipe(getAddressIndex.orThrow('The address index is missing!'));
```
