export type TranslatorWithoutContext<SourceType, TargetType = SourceType> = (
  translatable: SourceType | undefined,
) => TargetType;

export type TranslatorWithContext<SourceType, TargetType, CtxType> = (
  translatable: SourceType | undefined,
  ctx: CtxType,
) => TargetType;

export type Translator<
  SourceType,
  TargetType = SourceType,
  CtxType extends undefined | Record<string, unknown> = undefined,
> = CtxType extends undefined
  ? TranslatorWithoutContext<SourceType, TargetType>
  : TranslatorWithContext<SourceType, TargetType, CtxType>;
