# Penumbra UI

This package contains the UI components for the Penumbra web.

## Set up

First, install the library:

```bash
npm i @penumbra-zone/ui
```

Then, configure the Tailwind in your project. Edit `tailwind.config.js`:

```js
export default {
  content: [
    // Parses the classes of the UI components
    './node_modules/@penumbra-zone/ui/**/*.js',
  ],
};
```

Finally, import the library CSS to the entry point of your app:

```js
import '@repo/ui/styles/globals.css';
```
