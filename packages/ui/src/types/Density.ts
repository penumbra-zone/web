/**
 * The density for a given layout. Generally, `sparse` is the correct size
 * choice (and is thus the default for any components that use the
 * `useDensity()` hook). But you can use `compact` for layouts containing a lot
 * of data that should be presented in a denser layout.
 *
 * See `<DensityContext />`
 */
export type Density = 'compact' | 'sparse';
