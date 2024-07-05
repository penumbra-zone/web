# Penumbra UI

The Penumbra UI library is a set of UI components purpose-built for the Penumbra ecosystem. Use these components to get rendering of various Penumbra data types out of the box, and to create a UI that is consistent with other Penumbra UIs' look and feel.

## Set up

First, install the library:

```bash
npm install @penumbra-zone/ui
```

Then, use components by importing them from their specific files:

```tsx
import { ValueViewComponent } from '@penumbra-zone/ui/ValueViewComponent';
```

Deprecated components can be imported from `@penumbra-zone/ui/components/ui/<component-name>`, where `<component-name>` should be replaced with the kebab-cased component name.

## Development

These guidelines are for maintainers of the components in the Penumbra UI library.

### Components must be located at `./components/v2/<ComponentName>/index.tsx`.

This ensures that the Penumbra UI `package.json` `exports` field works as intended, so that components can be imported via `@penumbra-zone/ui/<ComponentName>`.

Note that `<ComponentName>` should be replaced with the `UpperCamelCase` component name — e.g., `./components/v2/LoadingIndicator/index.tsx`.

### Components that are only used within a parent component must sit in the parent component's directory, rather than be a sibling of the parent directory.

```
- src/components/
  - HeaderWithDropdown/
    - index.tsx
    - Dropdown.tsx ✅ Correct, if Dropdown is only ever used inside HeaderWithDropdown
```

```
- src/components/
  - Dropdown.tsx ❌ Wrong, if Dropdown is only ever used inside HeaderWithDropdown
  - HeaderWithDropdown/
    - index.tsx
```

(One exception to this rule: if you're developing a component that will eventually be used by multiple other components, and just happens to be a child of only a single component at the moment, you can leave it as a sibling of its parent.)

### Components should be located at the most specific possible directory level.

For example, if the `Dropdown` component is used by both `HeaderWithDropdown` and `Menu` components, `Dropdown` should be placed in the lowest-level directory that contains both `HeaderWithDropdown` and `Menu`:

```
- src/components/
  - SomeCommonParentOfBothHeaderWithDropdownAndMenu/
    - index.tsx
    - HeaderWithDropdown/
      - index.tsx
      - index.test.tsx
    - Menu/
      - index.tsx
      - index.test.tsx
    - Dropdown.tsx ✅ Correct - Dropdown is used by both Menu and HeaderWithDropdown, so it's a sibling to both
```

This, as opposed to e.g., placing it inside the `HeaderWithDropdown` directory (and then importing it from there in `Menu`), or inside a root-level directory. This way, components are nested as closely to the components using them as possible.

```
- src/components/
  - SomeCommonParentOfBothHeaderWithDropdownAndMenu/
    - index.tsx
    - HeaderWithDropdown/
      - index.tsx
      - index.test.tsx
      - Dropdown.tsx ❌ Wrong - Menu shouldn't be importing a child of HeaderWithDropdown
    - Menu/
      - index.tsx
      - index.test.tsx
```

### Component props should be typed inline in the component function definition.

For example:

```tsx
export function MyComponent({ color }: { color: Color }) {
  // ...
}
```

This makes component code easy to read. An exception to this may be made when props are especially complex, such as when they are conditional.

There is no need to export the props interface, since consumers can simply use `React.ComponentProps<typeof ComponentName>` to extract the props interface from the component.

### Components must not accept `className` or `style` props.

This ensures that each component is internally responsible for its own styling.

Any variations of the component's appearance must be controlled via props like `variant`, `state`, etc. — not by kitchen-sink props like `className` and `style`, which allow arbitrary changes to be made that could interfere with the internal structure of the component and cause visual inconsistencies between instances of Penumbra UI components.

### Components should not define external margins or absolute/fixed positioning.

Components may only define their internal spacing and layout — never external spacing and layout. This ensures that components can be reused in any context.

External spacing and positioning is the responsibility of parent components, and can be achieved in the parent via, e.g., wrapper `<div />`s that position components appropriately.

(Note that absolute positioning _is_ acceptable for elements who have a higher-level relative-positioned element in the same component, since that means that the absolute-positioned element is still contained within the component's layout. There also a few exceptions to this rule, such as for tooltips and dropdown menus, as well as for page-level components that absolutely position a child component via a wrapper.)

#### Correct

```tsx
// BackgroundAnimation/index.tsx
export function BackgroundAnimation() {
  return <img src='./animation.gif' />;
}

// SplashPage/index.tsx
export function SplashPage() {
  return (
    // ✅ CORRECT: position the background animation in the center of the screen
    // using a wrapper div in the parent
    <div className='absolute top-1/2 left-1/2 -translate-1/2'>
      <BackgroundAnimation />
    </div>
  );
}
```

#### Incorrect

```tsx
// BackgroundAnimation/index.tsx
export function BackgroundAnimation() {
  return (
    // ❌ INCORRECT: do not absolute-position elements in a non-page-level
    // component
    <div className='absolute top-1/2 left-1/2 -translate-1/2'>
      <img src='./animation.gif' />;
    </div>
  );
}

// SplashPage/index.tsx
export function SplashPage() {
  return <BackgroundAnimation />;
}
```

#### Correct

```tsx
// AssetIcon/index.tsx
export function AssetIcon({ display, src }: { display: string; src: string }) {
  return <img src={src} alt={`Icon for the ${display} asset`} />;
}

// ValueComponent/index.tsx
export function ValueComponent({ value, metadata }: { value: Value; metadata: Metadata }) {
  return (
    <Pill>
      // ✅ CORRECT: define space around components using wrapper divs
      <div className='flex gap-2'>
        <AssetIcon display={metadata.display} src='./icon.png' />

        {metadata.display}
      </div>
    </Pill>
  );
}
```

#### Incorrect

```tsx
// AssetIcon/index.tsx
export function AssetIcon({ display, src }: { display: string; src: string }) {
  return (
    <img
      src={src}
      alt={`Icon for the ${display} asset`}
      // ❌ INCORRECT: do not define external margins for a component
      className='mr-2'
    />
  );
}

// ValueComponent/index.tsx
export function ValueComponent({ value, metadata }: { value: Value; metadata: Metadata }) {
  return (
    <Pill>
      <AssetIcon display={metadata.display} src='./icon.png' />
      {metadata.display}
    </Pill>
  );
}
```

### Components should include Storybook stories.

[Storybook stories](https://storybook.js.org/docs/react/writing-stories/introduction) are pages in Storybook that show a particular component, usually in a specific state.

Storybook stories should be located next to the component they apply to, and have a file suffix of `.stories.ts(x)`. For example, a component located at `components/v2/Button/index.tsx` should have stories at `src/components/v2/Button/index.stories.ts`.

When writing stories, make sure to tag your stories with [`autodocs`](https://storybook.js.org/docs/react/writing-docs/autodocs). This is a Storybook feature that analyzes your component code to auto-generate documentation for your component, including a code sample, controls for each of the props, etc.

### Documentation of component props should be written with JSDoc syntax.

[JSDoc-style comments](https://jsdoc.app/about-getting-started.html#adding-documentation-comments-to-your-code) (`/** ... */`) should be written before any props that need to be documented so that A) IDEs can pull them in for tooltips, and B) Storybook can use them in the Storybook UI.

### Components built for Protobuf types must be suffixed with `Component` to avoid naming collisions.

For example, a component designed to render a `ValueView` must be named `ValueViewComponent`, rather than `ValueView`, to avoid awkward naming collisions for consumers:

```tsx
// ValueViewComponent/index.tsx
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export function ValueViewComponent({ valueView }: { valueView: ValueView }) {
  // ...
}

// SomeConsumer.tsx
// ✅ Now, there is no naming conflict between these two imports.
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueViewComponent';
```
