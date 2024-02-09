# ADR 001: Using getters to handle polymorphic and optional types in Protobufs

In [web#458](https://github.com/penumbra-zone/web/issues/458), and in a follow-up meeting on February 8, 2024, we discussed the need for an elegant approach to accessing deeply nested properties on deserialized Protobuf objects, for which all properties are optional, and for which some properties' existence is conditional based on the value of a `case` property.

Let's use `AddressView` as an example. Ignoring its methods for a moment, here's what `AddressView` looks like as a TypeScript interface:

```ts
interface AddressView {
  addressView:
    | {
        case: 'opaque';
        value: {
          address?: Address;
        };
      }
    | {
        case: 'decoded';
        value: {
          address?: Address;
          index?: AddressIndex;
          walletId?: WalletId;
        };
      }
    | {
        case: undefined;
        value?: undefined;
      };
}
```

If you want to render an address index (such as "Account #0"), you'd need do it like so:

```TSX
<div>
  {addressView.addressView.case === 'decoded' &&
    addressView.addressView.value.index?.account &&
      <span>{addressView.addressView.value.index.account}</span>
  }
</div>
```

This is obviously a bit cumbersome, especially if you need to repeat that logic in multiple places. So we discussed a few solutions to this, which you can see in the ticket linked above. Most of the discussion was centered around type guards: functions that would let TypeScript's engine know that the required properties were present on the object.

But we realized that the crux of the issue was about _accessing_ those properties, not just asserting that they were present. So the solution we settled on was getter functions.

Getter functions are basically the "getter" half of the functional-programming [lens](https://www.bekk.christmas/post/2019/6/the-lens-pattern-in-typescript) pattern. They allow us to access deeply nested properties that may or may not be present, sometimes depending on the value of another property (like the address view's `case`):

```tsx
<div>
  <span>
    {/* Note the `?` near the end, since we may be getting `undefined`. */}
    {getAddressIndex(addressView)?.account}
  </span>
</div>
```

If we want to ensure that the value is not `undefined`, we can add an `orThrow`:

```tsx
<div>
  <span>
    {/* Note the `.account` at the end. This is only possible because we called
    `.orThrow()`. Otherwise, TypeScript would have warned us that the return
    value of `getAddressIndex()` could be undefined. */}
    {getAddressIndex.orThrow(addressView, 'address index was missing').account}
  </span>
</div>
```

A handy byproduct of using getters, which is one of the reasons the lens pattern was originally developed, is that it allows us to access deeply nested properties without worrying about the shape of the object we're accessing. That is, if the shape of `AddressView` were to change in the future, we wouldn't have to update all the places in our code where we are accessing its deeply nested properties. Rather, we'd just change our getters in one place, and our code would continue to work.

## Trade-off

It's worth noting that getters don't make compile-time assertions about the type after being called. That is, you can't use them inside an `if` statement and then safely access deeply nested properties inside the `if` block:

```ts
if (getAddressIndex(addressView)) {
  // ❌ TypeScript will complain that `value` may be undefined:
  console.log(addressView.addressView.value.index.account);
}
```

Rather, they just return the property, or optionally throw if so configured. So, while the values they return are indeed typesafe at both compile- and run-time, they don't provide the functionality of a type guard. (See "Future work" below for more on this.)

## Future work

In the future, we may find that we still want to use some sort of type guards after all -- for example, so that a child component can trust that its `addressView` prop has a `case` of `decoded`, and has an `index.account` property. In that case, we can revisit the solutions in the issue linked above, perhaps using intersection types to indicate that certain properties exist. Those solutions would still be perfectly compatible with using getters, too, since getters are lightweight and don't impose themselves on many parts of the system.
