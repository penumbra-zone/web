// Thanks to https://stackoverflow.com/a/65278278/974981 for the prefixer
// utility types
type Prefix<K extends string, T extends string> = `${K}${T}`;

type Prefixer<K, T extends string> = {
  [P in keyof K as Prefix<T, string & P>]: K[P];
};

export type AsTransientProps<T extends Record<string, unknown>> = Prefixer<T, '$'>;

/**
 * Converts a props object to an object of "transient props" -- i.e., where each
 * key is prefixed with a `$` to indicate to styled-components that it should
 * not be passed down to the DOM element.
 *
 * @see https://styled-components.com/docs/api#transient-props
 * @internal
 */
export const asTransientProps = <T extends Record<string, unknown>>(
  props: T,
): AsTransientProps<T> =>
  Object.entries(props).reduce<Partial<AsTransientProps<T>>>((prev, curr) => {
    const [key, value] = curr;
    return { ...prev, [`$${key}`]: value };
  }, {}) as unknown as AsTransientProps<T>;
