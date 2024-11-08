# Penumbra UI

The Penumbra UI library is a set of UI components purpose-built for the Penumbra ecosystem. Use these components to get rendering of various Penumbra data types out of the box, and to create a UI that is consistent with other Penumbra UIs' look and feel.

## Storybook

All Penumbra UI components in the latest tagged release can be found at the Penumbra UI Storybook site: https://ui.penumbra.zone/

To view the latest components merged to `main` (even if they are not yet in a tagged release), check out the Storybook Preview site: https://preview.ui.penumbra.zone/

## Set up

First, install the library:

```bash
npm install @penumbra-zone/ui
```

Then, extend the Tailwind config of your app to include Penumbra UI's Tailwind config:

```ts
import { withPenumbra } from '@penumbra-zone/ui/theme';

// Provide your own theme and plugins inside the `withPenumbra` hook
export default withPenumbra({
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,css}'],
  theme: {},
  plugins: [],
});
```

In your main file, import Penumbra UI global styles:

```ts
import '@penumbra-zone/ui/style.css';
```

## Usage

### Density

Many Penumbra UI components come in two densities: `sparse` and `compact`. This feature allows Penumbra UI consumers to choose how to present data based on the context. For example, a table with dozens or hundreds of rows would be well suited to a `compact` density, while an interactive form could use the `sparse` density.

To control density, use the `<Density />` component with either the `sparse` or `compact` prop:

```tsx
<Density compact>
  <Table>{/* ... */}</Table>
</Density>
```

In the example above, the `<Table />` (and all Penumbra UI components inside of it that have density variants) will use the `compact` variant, ensuring consistency throughout the layout.

To enable density variants in your own components and layouts, import and use the `useDensity()` hook:

```tsx
const MyComponent = () => {
  const density = useDensity();

  return <div style={{ padding: density === 'sparse' ? '8px' : '4px' }}>{/* ... */}</div>;
};
```

That way, `<MyComponent />` will have looser padding when wrapped with `<Density sparse />`, and tighter when wrapped with `<Density compact />`.

## Development

These guidelines are for maintainers of the components in the Penumbra UI library.

### Guiding principles

To ensure consistency in the code design of the Penumbra UI components, and to maintain an optimal developer experience, developers should adhere to these guidelines.

#### Keep design decisions to a minimum for Penumbra UI consumers.

Penumbra UI aims to take as much as possible of the design-related decision-making out of developers' hands. Developers using Penumbra UI should be freed up to focus on _functionality_, rather than needing to think about what colors would "look nice" or what spacing would "feel right." Specifically:

##### Props and their values should be named to indicate their _use_, rather than their _effect on appearance_.

For example, buttons have a `priority` prop to determine whether a given button is `primary` or `secondary`. This allows consumers to set the prop based on how the button is _used_: if it's the "Confirm" button for a popup dialog, it would obviously have a `primary` priority. If it's a "Cancel" button underneath the "Confirm" button, it would have a `secondary` priority.

It just so happens that the primary button has a filled-in, solid-color background, while the secondary button has a transparent background and a subtle border. Notice, though, that Penumbra UI buttons don't accept `backgroundColor` or `borderColor` props. Nor do they accept `className` props that would allow consumers to customize their appearance in any number of other ways (that would be even worse!). For that matter, they don't even have a `variant` prop with values like `filled` vs. `outlined`. Why not? Because if they did, two developers working on the same app might end up using those visual styles in inconsistent ways, resulting in a disjointed UI.

Instead, the `priority` prop is so named to indicate that it should be set based on how the button is used. Then, Penumbra UI itself makes the right decision about how to style it based on that use case.

##### Components must not accept `className` or `style` props.

This ensures that each component is internally responsible for its own styling.

Any variations of the component's appearance must be controlled via props like `state`, `priority` etc. — not by kitchen-sink props like `className` and `style`, which allow arbitrary changes to be made that could interfere with the internal structure of the component and cause visual inconsistencies between instances of Penumbra UI components.

##### Components should not define external margins or absolute/fixed positioning.

Components may only define their internal spacing and layout — never external spacing and layout. This ensures that components can be reused in any context.

External spacing and positioning is the responsibility of parent components, and can be achieved in the parent via, e.g., wrapper `<div />`s that position components appropriately.

(Note that absolute positioning _is_ acceptable for elements who have a higher-level relative-positioned element in the same component, since that means that the absolute-positioned element is still contained within the component's layout. There also a few exceptions to this rule, such as for tooltips and dropdown menus, as well as for page-level components that absolutely position a child component via a wrapper.)

###### Correct

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

###### Incorrect

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

###### Correct

```tsx
// AssetIcon/index.tsx
export interface AssetIconProps {
  display: string;
  src: string;
}

export function AssetIcon({ display, src }: AssetIconProps) {
  return <img src={src} alt={`Icon for the ${display} asset`} />;
}

// ValueComponent/index.tsx
export interface ValueComponentProps {
  value: Value;
  metadata: Metadata;
}

export function ValueComponent({ value, metadata }: ValueComponentProps) {
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

###### Incorrect

```tsx
// AssetIcon/index.tsx
export interface AssetIconProps {
  display: string;
  src: string;
}

export function AssetIcon({ display, src }: AssetIconProps) {
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
export interface ValueComponentProps {
  value: Value;
  metadata: Metadata;
}

export function ValueComponent({ value, metadata }: ValueComponentProps) {
  return (
    <Pill>
      <AssetIcon display={metadata.display} src='./icon.png' />
      {metadata.display}
    </Pill>
  );
}
```

#### Document and test Penumbra UI components thoroughly.

Penumbra UI is a public package available for anyone in the Penumbra ecosystem to use. As such, its documentation and tests should be given first-class treatment. Specifically:

##### Components should include Storybook stories.

[Storybook stories](https://storybook.js.org/docs/react/writing-stories/introduction) are pages in Storybook that showcase a particular component, usually with controls that allow the user to edit its props.

Storybook stories should be located next to the component they apply to, and have a file suffix of `.stories.ts(x)`. For example, a component located at `src/Button/index.tsx` should have stories at `src/Button/index.stories.tsx`.

When writing stories, make sure to tag your stories with [`autodocs`](https://storybook.js.org/docs/react/writing-docs/autodocs). This is a Storybook feature that analyzes your component code to auto-generate documentation for your component, including a code sample, controls for each of the props, etc.

##### Documentation of component props should be written with JSDoc syntax.

[JSDoc-style comments](https://jsdoc.app/about-getting-started.html#adding-documentation-comments-to-your-code) (`/** ... */`) should be written before any props that need to be documented so that A) IDEs can pull them in for tooltips, and B) Storybook can use them in the Storybook UI.

##### Components' rendering logic should be covered via unit tests.

```tsx
// FooBarAndMaybeBaz/index.tsx
export interface FooBarAndMaybeBazProps {
  baz?: boolean;
}

export function FooBarAndMaybeBaz({ baz }: FooBarAndMaybeBazProps) {
  return (
    <ul>
      <li>Foo</li>
      <li>Bar</li>
      {baz && <li>Baz</li>}
    </ul>
  );
}

// FooBarAndMaybeBaz/index.test.tsx
import { render } from '@testing-library/react';

describe('<FooBarAndMaybeBaz />', () => {
  it('renders `baz` when the `baz` prop is `true`', () => {
    const { queryByText } = render(<FooBarAndMaybeBaz baz />);

    expect(queryByText('Baz')).not.toBeNull();
  });

  it('does not render `baz` when the `baz` prop is falsy', () => {
    const { queryByText } = render(<FooBarAndMaybeBaz />);

    expect(queryByText('Baz')).toBeNull();
  });
});
```

Note that we do not use unit tests to test the visual appearance of components; that's a job better suited to screenshot testing, which we may implement in the future.

### Code style and file organization guidelines

#### Component directories must have `index.tsx` file with all necessary exports.

This ensures that the Penumbra UI `package.json` `exports` field works as intended, so that components can be imported via `@penumbra-zone/ui/<ComponentName>`.

Note that `<ComponentName>` should be replaced with the `UpperCamelCase` component name — e.g., `./src/LoadingIndicator/index.tsx`.

#### Internal-use components that are only used within a parent component must sit in the parent component's directory, rather than be a sibling of the parent directory.

This guideline only applies to components that are _not_ intended to be used externally, but are only to be used as dependencies of other Penumbra UI library components.

```
- src/
  - HeaderWithDropdown/
    - index.tsx
    - Dropdown.tsx ✅ Correct, if Dropdown is only ever used inside HeaderWithDropdown
```

```
- src/
  - Dropdown.tsx ❌ Wrong, if Dropdown is only ever used inside HeaderWithDropdown
  - HeaderWithDropdown/
    - index.tsx
```

(One exception to this rule: if you're developing a component that will eventually be used by multiple other components, and just happens to be a child of only a single component at the moment, you can leave it as a sibling of its parent.)

#### Component props must be exported from the component file as `<ComponentName>Props`.

For example:

```tsx
export interface MyComponentProps {
  color: Color;
}

export function MyComponent({ color }: MyComponentProps) {
  // ...
}
```

#### Components built for Protobuf types must be suffixed with `Component` to avoid naming collisions.

For example, a component designed to render a `ValueView` must be named `ValueViewComponent`, rather than `ValueView`, to avoid awkward naming collisions for consumers:

```tsx
// ValueView/index.tsx
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface ValueViewComponentProps {
  valueView: ValueView;
}

export function ValueViewComponent({ valueView }: ValueViewComponentProps) {
  // ...
}

// SomeConsumer.tsx
// ✅ Now, there is no naming conflict between these two imports.
import { ValueView } from 'penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueViewComponent';
```

#### Use the `useDensity()` hook to control component density.

Components should never accept a `density` prop to control their density. This ensures that all components in a given density context will be rendered with the same density.

##### Using density with Storybook

If you're creating a component that has density variants, use the `density` tag for your Storybook stories:

```ts
const meta: Meta<typeof MyComponent> = {
  component: MyComponent,
  tags: ['density'],
  // ...
};
```

Storybook will then add a control for density, so that density can be controlled via context.
