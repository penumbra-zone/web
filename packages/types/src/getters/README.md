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

Getters solve all that. Getters are tiny, composable functions that allow you to get at deeply nested, often optional properties without all the boilerplate.

Let's solve the above problem with getters. First, let's create a getter that, when given a `MemoView`, gets its `AddressView`:

```ts
const getAddress = createGetter<MemoView, AddressView>(memoView =>
  memoView.memoView.case === 'visible' ? memoView.memoView.plaintext?.returnAddress : undefined,
);
```

Then we'll create another getter that, when given an `AddressView`, gets its `AddressIndex`:

```ts
const getAddressIndex = createGetter<AddressView, AddressIndex>(addressView =>
  addressView?.addressView.case === 'decoded' ? addressView.addressView.value.index : undefined,
);
```

Now, in our template, we can pipe those two together to create a getter from a `MemoView` to an `AddressIndex`:

```tsx
<div>
  <span>{getAddress.pipe(getAddressIndex)(memoView)}</span>
</div>
```

Already, our component code is a lot cleaner. But note that a getter can return `undefined` at any step of the pipe! Perhaps we don't want that -- perhaps we want to assert that the value _has_ to be there. In that case, we can append `.orThrow()` to our getter:

```tsx
<div>
  <span>{getAddress.pipe(getAddressIndex).orThrow(memoView)}</span>
</div>
```

This will throw an error if the getter chain returns `undefined`. If we want it to throw an error with a specific message, we can pass that message as the second argument to `.orThrow()`:

```tsx
<div>
  <span>
    {getAddress
      .pipe(getAddressIndex)
      .orThrow(memoView, 'Either the address or the address index is missing!')}
  </span>
</div>
```

Lastly, for even more brevity, you can save a chain of getters to a variable, which then becomes its _own_ getter:

```tsx
const getAddressIndexFromMemoView = getAddress.pipe(getAddressIndex).orThrow;

<div>
  <span>{getAddressIndexFromMemoView(memoView)</span>
</div>
```
