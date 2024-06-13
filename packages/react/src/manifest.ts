/** Currently, Penumbra manifests are chrome extension manifest v3. There's no type
 * guard because manifest format is enforced by chrome. This type only describes
 * fields we're interested in.
 *
 * @see https://developer.chrome.com/docs/extensions/reference/manifest#keys
 */
export interface PenumbraManifest {
  /**
   * manifest id is present in production, but generally not in dev, because
   * they are inserted by chrome store tooling. crx id are simple hashes of the
   * 'key' field, an extension-specific public key.
   *
   * developers may configure a public key in dev, and the extension id will
   * match appropriately, but will not be present in the manifest.
   *
   * the extension id is also part of the extension's origin URI.
   *
   * @see https://developer.chrome.com/docs/extensions/reference/manifest/key
   * @see https://web.archive.org/web/20120606044635/http://supercollider.dk/2010/01/calculating-chrome-extension-id-from-your-private-key-233
   */
  id?: string;
  key?: string;

  // these are required
  name: string;
  version: string;
  description: string;

  // these are optional
  homepage_url?: string;
  options_ui?: { page: string };
  options_page?: string;

  // icons are not indexed by number, but by a stringified number. they may be
  // any square size but the power-of-two sizes are typical. the chrome store
  // requires a '128' icon.
  icons: Record<`${number}`, string> & {
    ['128']: string;
  };
}
