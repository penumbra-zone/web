import { MethodInfo, ServiceType } from '@bufbuild/protobuf';
import { MethodImpl, ServiceImpl } from '@connectrpc/connect';

export type CreateAnyMethodImpl<S extends ServiceType> = <N extends keyof S['methods']>(
  methodInfo: S['methods'][N],
  localName: N,
) => MethodImpl<S['methods'][N]>;

export const makeAnyServiceImpl = <S extends ServiceType>(
  service: S,
  createMethod: CreateAnyMethodImpl<S>,
): ServiceImpl<S> => {
  const impl = {} as ServiceImpl<S>;
  let localName: keyof S['methods'];
  let methodInfo: MethodInfo & S['methods'][typeof localName];
  for ([localName, methodInfo] of Object.entries(service.methods))
    impl[localName] = createMethod(methodInfo, localName);
  return impl;
};
