export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'xxl'
  | 'large'
  | 'p'
  | 'strong'
  | 'detail'
  | 'xxs'
  | 'small'
  | 'detailTechnical'
  | 'technical'
  | 'body'
  | 'tableHeading'
  | 'tableHeadingMedium'
  | 'tableHeadingSmall';

type TextType = {
  [K in TextVariant]: Record<K, true> & Partial<Record<Exclude<TextVariant, K>, never>>;
}[TextVariant];

export type TypographyProps =
  | (TextType & { variant?: never })
  | {
      /** dynamic typography variant as a string: `'h1' | 'body' | 'large' | 'p' | 'strong' | etc. */
      variant?: TextVariant;
    };
