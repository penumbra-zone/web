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
- Add buf registry: `npm config set @buf:registry https://buf.build/gen/npm/v1/`

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

## License

This project is dual-licensed under MIT and Apache-2.0
