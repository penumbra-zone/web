# ADR 002: Client-side rendering + hash routing

We want minifront to be developed in such a way that is:

- privacy preserving
  - maximally client side
- can be run by PD (penumbra rpc node)
  - statically rendered
  - not requiring special server config
  - can be run by generic static file server

Doing so requires us to be quite deliberate on what our web stack looks like.

### History

We first began the app as a Next.js app. However, Next.js is very server-focused and does not support patterns like data loaders that are quite helpful for
client-side only apps. So we [migrated to React-Router](https://github.com/penumbra-zone/web/pull/227).

Upon trying to allow PD to host the build output, we found that the default vite config requires you to set re-directs
for all routes and point it to `index.html` (which would hydrate the react app and take over the routing). This means a special server
configuration would be required. It's not just drag-and-drop.

The solution we had was to use React-Router's [hash router](https://github.com/penumbra-zone/web/pull/372/files).
The url looks like this:

```
https://app.testnet.penumbra.zone/#/dashboard
```

Our output build is still a single `index.html`. However, the hash effectively performs the re-direct (route after `#` not sent to the server).

Afterward, we noticed [a few drawbacks to the hash router](https://github.com/penumbra-zone/web/issues/310#issuecomment-1904608594).
It's not _really_ idiomatic web routing. We were also not doing pre-rendering or code-splitting (not as performant as we could be). The idea was discussed to migrate
to a "meta-framework" that would handle all of this for us. However, we discovered code-splitting by route is _not_ privacy preserving.
It allows any network adversary to watch a user's activity as they navigate the app (since the requests are predictable and content-free, they may leak paths through the length of the encrypted data, which TLS does not protect).

If we are not code-splitting, pre-rendering html by route also doesn't make sense.
Unfortunately, the better performance characteristics is not compatible with our stated philosophical goals.
The momentum in the industry of web stack tech (putting more responsibility on the server) does not serve us well.

### Settled design

- [Vite](https://vitejs.dev/) client-side react app
- [React-Router](https://reactrouter.com/en/main) hash router
- Client-side [data loaders](https://reactrouter.com/en/main/route/loader)

### Future work to consider

Remix.js is the successor to React-Router (same authors). However, Ryan Florence has realized a ton of
apps still prefer client-side-rendering (like ours). So they've built [SPA mode](https://remix.run/docs/en/main/future/spa-mode).
This is meant to bridge React-Router users into an upgraded experience and incrementally adopt SSR.
We won't adopt any of the server features, however, some of the other stuff in the library does look compelling.
I'd anticipate React-Router may be deprecated in the next few years because of this.
