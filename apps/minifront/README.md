# Minifront

A minimal frontend for interacting with the [Penumbra](https://penumbra.zone/) chain.
Every Penumbra RPC endpoint will be hosting this static frontend as it is embedded into the node software.

**Note**: A Penumbra wallet extension is required for full functionality.

A number of technical decisions were made to ensure minifront is maximally client side and does not leak
information unnecessarily:

- Client-side biased js framework ✅
- Hash routing ✅
- Pre-load all static assets ⚠️ (in progress...)
- Server rendering ❌
- Route-based code splitting ❌
- Idiomatic urls & query params ❌
- Build-time pre-rendering ❌

[Read more](https://x.com/grod220/status/1760217326245285923) about how this frontend embraces censorship resistance and privacy.

## Deploy anywhere

The `dist/` output of the build is simply static assets. That means, it basically can be hosted anywhere.
First, download `dist.zip` from the [latest minifront release from github](https://github.com/penumbra-zone/web/releases?q=minifront&expanded=true).
Unzip that and take it to a variety of host providers. Examples:

### Vercel

```shell
npm i -g vercel # install the Vercel cli
vercel login
vercel ./dist
```

### Netlify

```shell
npm install netlify-cli -g # install the netlify cli
netlify login
cd ./dist
netlify deploy
```

### Github pages

Can follow [this guide](https://pages.github.com/).
Let's say your username is **roboto7237**.
First create a new repo specifically named in this format: roboto7237.github.io. Then do:

```shell
git clone https://github.com/roboto7237/roboto7237.github.io
cp -r ./dist/* ./roboto7237.github.io/ # copies all minifront code into the new folder
git add --all
git commit -m "Initial commit"
git push -u origin main
```

### Others

There are a ton of other places where static files can be hosted:

- [Cloudflare pages](https://pages.cloudflare.com/)
- [Firebase](https://firebase.google.com/docs/hosting)
- [Render](https://render.com/)
- [Surge](https://surge.sh/)
- [Google cloud](https://cloud.google.com/storage/docs/hosting-static-website)
- [AWS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

## Build locally

Prerequisites:

- Install [nodejs](https://nodejs.org/)
- Install [pnpm](https://pnpm.io/installation)

```shell
pnpm install
pnpm dev
# Will be live at https://localhost:5173/
```

## Technologies Used

- TypeScript
- React
- vite / vitest
- Turborepo
- react-router-dom
- zustand
- tailwindcss
- framer-motion
- @bufbuild/protobuf
- @testing-library/react

## CSS & Tailwind Configuration

### Dual Theme Architecture

Minifront uses a specialized architecture to handle two Tailwind themes simultaneously:

1. **The Legacy Theme** - Defined in `packages/tailwind-config/index.js` and used by minifront
2. **The V2 Theme** - Defined in `packages/ui/src/theme/tailwind-config.ts`

To prevent conflicts between these themes, we've implemented a build system that creates prefixed versions of all v2 styles:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────────┐
│ packages/ui     │     │ packages/ui     │     │ apps/minifront          │
│ tailwind.config.ts ├──►│ style.css      │────►│ Uses unprefixed CSS for │
│ (unprefixed)    │     │ (unprefixed)    │     │ legacy components       │
└─────────────────┘     └─────────────────┘     └─────────────────────────┘
                                                            ▲
┌─────────────────┐     ┌─────────────────┐                │
│ packages/ui     │     │ packages/ui     │                │
│ tailwind.config.├──►│ style-prefixed.css ├───────────────┘
│ prefixed.ts     │     │ (v2- prefixed)  │
└─────────────────┘     └─────────────────┘
```

### Build Configuration

The dual CSS generation is configured in `packages/ui/package.json`:

```json
"scripts": {
  "build": "vite build && pnpm run build:css && pnpm run build:css:prefixed",
  "build:css": "pnpm exec tailwindcss -c ./tailwind.config.ts -i ./src/styles/main.css -o ./dist/style.css --minify",
  "build:css:prefixed": "pnpm exec tailwindcss -c ./tailwind.config.prefixed.ts -i ./src/styles/main.css -o ./dist/style-prefixed.css --minify",
  // ...other scripts
}
```

The key files enabling this are:

1. **`packages/ui/tailwind.config.ts`**: Standard configuration for normal usage

   ```typescript
   export default {
     content: ['./src/**/*.{tsx,ts}'],
     theme: tailwindConfig.theme,
   } satisfies Config;
   ```

2. **`packages/ui/tailwind.config.prefixed.ts`**: Configuration adding a prefix to all classes

   ```typescript
   export default {
     prefix: 'v2-',
     content: ['./src/**/*.{tsx,ts}'],
     theme: tailwindConfig.theme,
   } satisfies Config;
   ```

3. **`packages/ui/src/styles/main.css`**: Common input for both builds
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### CSS Import Strategy

In minifront, we handle both themes by:

1. In `main.tsx`: Importing the unprefixed CSS for legacy minifront components

   ```typescript
   import '@penumbra-zone/ui/style.css';
   import './index.css';
   ```

2. In `index.css`: Importing the prefixed CSS for v2 components
   ```css
   @import '@penumbra-zone/ui/style-prefixed.css';
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

#### Import Order is Critical

The specific order of these imports is crucial for proper styling:

```
1. @penumbra-zone/ui/style.css      (unprefixed, loaded first in main.tsx)
2. @penumbra-zone/ui/style-prefixed.css (prefixed with v2-, imported in index.css)
3. @tailwind directives              (minifront's own styling via Tailwind)
```

This order ensures:

- Legacy components initially get their styling from the unprefixed CSS
- V2 components get their styling from the prefixed CSS
- If there are any conflicts, minifront's own Tailwind styles (generated from directives) take final precedence due to CSS cascade rules

This provides clear separation between:

- Legacy components using unprefixed classes (e.g., `bg-primary`)
- V2 components using their own styling through prefixed classes (e.g., `v2-bg-primary`)

### Adding V2 Components to Minifront

When importing v2 components from `@penumbra-zone/ui`, no extra steps are needed:

```jsx
// Example: Import and use a v2 component
import { AssetCard } from '@penumbra-zone/ui/AssetCard';

// The component uses classNames like "bg-primary" in its source
// But the CSS is loaded with the v2- prefix, so no conflicts occur
function MyComponent() {
  return <AssetCard asset={myAsset} />;
}
```

The component will automatically receive its styles from the prefixed CSS, preventing conflicts with minifront's legacy styling.

## License

This project is dual-licensed under MIT and Apache-2.0
