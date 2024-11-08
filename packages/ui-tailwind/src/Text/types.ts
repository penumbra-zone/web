/**
 * Utility interface to be used below to ensure that only one text type is used
 * at a time.
 */
interface NeverTextTypes {
  h1?: never;
  h2?: never;
  h3?: never;
  h4?: never;
  xxl?: never;
  large?: never;
  p?: never;
  strong?: never;
  detail?: never;
  small?: never;
  detailTechnical?: never;
  technical?: never;
  body?: never;
}

export type TextType =
  | (Omit<NeverTextTypes, 'h1'> & {
      /**
       * Renders a styled `<h1 />`. Pass the `as` prop to use a different HTML
       * element with the same styling.
       */
      h1: true;
    })
  | (Omit<NeverTextTypes, 'h2'> & {
      /**
       * Renders a styled `<h2 />`. Pass the `as` prop to use a different HTML
       * element with the same styling.
       */
      h2: true;
    })
  | (Omit<NeverTextTypes, 'h3'> & {
      /**
       * Renders a styled `<h3 />`. Pass the `as` prop to use a different HTML
       * element with the same styling.
       */
      h3: true;
    })
  | (Omit<NeverTextTypes, 'h4'> & {
      /**
       * Renders a styled `<h4 />`. Pass the `as` prop to use a different HTML
       * element with the same styling.
       */
      h4: true;
    })
  | (Omit<NeverTextTypes, 'xxl'> & {
      /**
       * Renders bigger text used for section titles. Renders a `<span />` by
       * default; pass the `as` prop to use a different HTML element with the
       * same styling.
       */
      xxl: true;
    })
  | (Omit<NeverTextTypes, 'large'> & {
      /**
       * Renders big text used for section titles. Renders a `<span />` by
       * default; pass the `as` prop to use a different HTML element with the
       * same styling.
       */
      large: true;
    })
  | (Omit<NeverTextTypes, 'p'> & {
      /**
       * Renders a styled `<p />` tag with a bottom-margin (unless it's the last
       * child). Aside from the margin, `<P />` is identical to `<Body />`.
       *
       * Note that this is the only component in the entire Penumbra UI library
       * that renders an external margin. It's a convenience for developers who
       * don't want to wrap each `<Text p />` in a `<div />` with the
       * appropriate margin, or a flex columnn with a gap.
       */
      p: true;
    })
  | (Omit<NeverTextTypes, 'strong'> & {
      /**
       * Emphasized body text.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      strong: true;
    })
  | (Omit<NeverTextTypes, 'detail'> & {
      /**
       * Detail text used for small bits of tertiary information.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      detail: true;
    })
  | (Omit<NeverTextTypes, 'small'> & {
      /**
       * Small text used for secondary information.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      small: true;
    })
  | (Omit<NeverTextTypes, 'detailTechnical'> & {
      /**
       * Small monospaced text used for code, values, and other technical
       * information.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      detailTechnical: true;
    })
  | (Omit<NeverTextTypes, 'technical'> & {
      /**
       * Monospaced text used for code, values, and other technical information.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      technical: true;
    })
  | (Omit<NeverTextTypes, 'body'> & {
      /**
       * Body text used throughout most of our UIs.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      body?: true;
    });
