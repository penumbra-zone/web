export type Translator<SourceType, TargetType = SourceType> = (
  translatable: SourceType | undefined,
) => TargetType;
