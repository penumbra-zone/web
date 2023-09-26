# Web workers

The heavy lifting of requests happen in the service worker. Unfortunately, it's an odd runtime environment
and doesn't have access to the same apis as a normal web app. Here is what we have confirmed:

- Using web-workers directly from a service worker. Not supported ❌
- Using wasm-threads (wasm-rayon-bindgen). Not supported as it uses web workers underneath the hood ❌
- Using offscreen api. Works ✅

The offscreen api workaround solution was [recommended by Google engineers](https://bugs.chromium.org/p/chromium/issues/detail?id=1219164).
It works by opening an invisible window and issue commands to it to access the full web api.
If it sounds hacky, it's because it is. Here is an [example code](https://github.com/GoogleChrome/chrome-extensions-samples/blob/f608c65e61c2fbf3749ccba88ddce6fafd65e71f/functional-samples/cookbook.offscreen-dom/background.js) of it in use.

Note: It doesn't look like [comlink](https://github.com/GoogleChromeLabs/comlink) works via this method.
