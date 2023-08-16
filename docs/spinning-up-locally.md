# Spinning things up

Installation Requirements:
- [Nodejs](https://nodejs.org/en)
- [pnpm](https://pnpm.io/installation)

```bash
pnpm install
pnpm dev
```

This will spin up both the webapp and extension on different ports.

### Running extension code from repo

1. Go to the Extensions page by entering chrome://extensions in a new tab
2. Enable Developer Mode by clicking the toggle switch next to Developer mode.
3. Click the Load unpacked button and select the extension directory [/apps/extension/dist/](../apps/extension/dist).
4. Pin your extension to the toolbar to quickly access your extension during development.
