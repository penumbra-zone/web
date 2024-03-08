# Writing performant React components

## Use component-specific Zustand selectors, rather than slice-specific Zustand selectors, wherever possible.

Some of our components use selectors that select an entire Zustand slice. This isn't great for performance, since it means that _every_ component that uses this selector will have to re-render when _any_ property in the slice changes, even if the given component is not using that particular property.

Instead, we should use Zustand selectors that only return the properties that the given component needs. That way, the component will only re-render when the properties it cares about change.

## Use inline selectors when a component only needs a single property from Zustand state.

See [this example](https://github.com/penumbra-zone/web/pull/705/files?diff=split&w=1#diff-964bf15a0e1f337ecd16caf03b5b5878828b4ad2e6c95004a85affe5ce2390a7R25-R27). Since we're only using a single property from the state, we can just inline the selector, and the component will only re-render when the output of that selector changes.

## Use `useShallow()` when a component needs multiple properties from Zustand state.

If we need multiple properties from the state, simply using `useStore()` with a selector that grabs the properties we need will result in unnecessary rerenders:

```tsx
const MyComponent = () => {
  const state = useStore(state => ({
    prop1: state.mySlice.prop1,
    prop2: state.mySlice.prop2,
  }));
  // ^ this object gets defined on every call, so `state` will update when _any_
  // state property changes, resulting in unnecessary re-renders
};
```

Instead, we should use [`useShallow()`](https://github.com/pmndrs/zustand/blob/main/docs/guides/prevent-rerenders-with-use-shallow.md) inside of `useStore()`. `useShallow()` iterates over each _top-level_ property in the object, and only triggers a re-render when one of those properties changes:

```tsx
const MyComponent = () => {
  const state = useStore(
    useShallow(state => ({
      prop1: state.mySlice.prop1,
      prop2: state.mySlice.prop2,
    })),
  );
  // ^ `useShallow()` iterates over this object, and only triggers a re-render
  // if one of the top-level properties changes.
};
```

For code cleanliness, extract such selectors to above the component definition:

```tsx
const myComponentSelector = (state: AllSlices) => ({
  prop1: state.mySlice.prop1,
  prop2: state.mySlice.prop2,
});

const MyComponent = () => {
  const state = useStore(useShallow(myComponentSelector));
};
```

For maintainability, these selectors should be colocated with the component rather than being exported from the slice file.
