# ADR 005: Styling the UI library

As we prepare to build out our new library of UI components, we need to decide from the get-go how we'll style our components with CSS -- specifically, whether to use Tailwind (which is used throughout Prax and minifront) vs. some other system like CSS modules or CSS-in-JS.

The new UI library will not only be consumed by minifront (and possibly Prax); it will also be consumed by other clients in the Penumbra ecosystem as they build UIs for Penumbra.

## Pros of using Tailwind

- Tailwind integrates nicely with the code we already have.
- We could export a Penumbra Tailwind config file that others could use throughout their app, not just for the components we define.
  - Counterpoint #1: Without using Tailwind, our UI library could just export all needed components and CSS variables for others to build a UI with it. That is, a Tailwind config file isn't necessary for consumers to build a UI with Penumbra UI primitives.
  - Counterpoint #2: Even if we use e.g. CSS-in-JS for the UI library's styling, we can still export a Tailwind config for others to use.
- Requiring consumers to use Tailwind does not cause a production performance hit, since Tailwind runs at build-time, not runtime.
- Using CSS modules or CSS-in-JS for our UI library _might_ require us to have duplicate code -- e.g., defining our colors, typefaces, etc. in both Tailwind (for minifront/Prax) and in CSS modules (for the UI library). Using Tailwind negates this issue.
  - Counterpoint: Actually, probably not true if we end up using CSS-in-JS. We could define a Tailwind configuration in our UI library and export it for consumers who _do_ use Tailwind, and also import its resolved config into our UI library for use with CSS-in-JS.

## Cons of using Tailwind

- We'd be requiring consumers to use Tailwind, even if they don't want to.
  - They would even have to integrate Tailwind into their build pipeline.
  - In short, they can't just use our library out of the box.
- We could cause conflicts with consumers' own Tailwind config.
  - For example, if we use `rust` as a color name, but the consumer has already defined a color called `rust`, either their or our components won't appear as designed. This may seem desirable -- i.e., what if the consumer _wants_ their own version of `rust`? -- but could cause serious UX problems if, e.g., their version of `rust` doesn't have enough contrast when used on text over a light background.
- Consumers could intentionally change their Tailwind config for the purpose of overriding our designs.
  - We _definitely_ don't want that. For example, they could redefine the `spacing` values so that `px-1` creates horizontal padding of `6px` instead of `4px`, which would screw up our designs throughout the library.
- Consumers will expect to be able to pass Tailwind classes to our UI components.
  - This relates to the first point: if consumers are required to _install and configure_ Tailwind just to use our library, they won't be happy about having to install a dependency they can't actually use.
- Consumers have to import `.css` files alongside our component files.
- Even if we figured out a way to compile our Tailwind CSS with our components so that consumers didn't need to install Tailwind, the resultant CSS would be inefficiently big.
  - For example, if three different Penumbra UI library components use `bg-card-radial`, then either A) for each component that uses that class, the class will need to be defined in that component's CSS file (resulting in code duplication), or B) we'll export a single kitchen-sink CSS file containing all the styles for _all_ the Penumbra UI library components, including all of those that the consumer doesn't use. Both of these result in overhead.
  - Counterpoint: The same will be true even if we use CSS modules or native CSS.

## CSS-in-JS

CSS-in-JS has largely fallen out of fashion with the advent of CSS preprocessing tools like CSS modules and Tailwind. However, a self-contained UI library is more or less the perfect use case for CSS-in-JS:

- It allows consumers to import atomic components without having to also import `.css` files.
- It allows JavaScript tree-shaking to get rid of unused styles, because they're defined in JavaScript rather than in CSS.
- It allows styles to be only defined once, no matter how many different components a consumer uses that depend on that style (since those components are referencing a single JavaScript constant, rather than a CSS class that needs to be copied into each component's CSS file, as per the "Cons of using Tailwind" above).

The main downside of CSS-in-JS is that there is a slight performance hit compared to native CSS:

> Byte-for-byte, JavaScript is still the most expensive resource we send to mobile phones, because it can delay interactivity in large ways.
>
> — [Addy Osmani](https://medium.com/@addyosmani/the-cost-of-javascript-in-2018-7d8950fbb5d4)

## Prior art for styling in non-headless UI libraries

CSS-in-JS is used by some of the most popular UI libraries in existence:

- [MUI](https://mui.com/system/styled/) (92.4k ⭐️)
- [Ant Design](https://ant.design/docs/react/customize-theme) (91k ⭐️)
- [Chakra UI](https://v2.chakra-ui.com/docs/styled-system/style-props) (37k ⭐️)

Other popular libraries _do_ use Tailwind, and thus require it as a peer dependency:

- [Tailwind UI](https://tailwindui.com/documentation), the UI library from the creators of Tailwind
- [NextUI](https://nextui.org/docs/guide/installation) (20.4k ⭐️)
  - Note that they created a [`nextui` Tailwind plugin](https://nextui.org/docs/customization/theme#setup) to make for easier integration with Tailwind.

Still others include a global CSS file that you need to import to use their UI library:

- [Radix Themes](https://www.radix-ui.com/themes/docs/overview/getting-started#2-import-the-css-file) (4.7k ⭐️)
- [React Bootstrap](https://react-bootstrap.netlify.app/docs/getting-started/introduction#stylesheets) (22.3k ⭐️)
- [PrimeReact](https://primereact.org/theming/#builtinthemes) (6.2k ⭐️)
- [Blueprint UI](https://blueprintjs.com/docs/#blueprint.quick-start) (20.5k ⭐️)

## Decision

Given the downsides of A) requiring consumers to import CSS files alongside component files (if we went with the CSS modules or native CSS route), and B) requiring users to use Tailwind (if we went the Tailwind route), we've decided to use CSS-in-JS so that consumers can import components out of the box with the styling they want. We've further decided to export a Tailwind configuration for the Penumbra UI, so that consumers who use Tailwind can use the same theme values as the Penumbra UI library. The Penumbra UI library will also use the Tailwind configuration for its CSS-in-JS values.
