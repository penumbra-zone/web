import { FC, useMemo } from 'react';
import { Text } from '@repo/ui/Text';
import { ServiceType } from '@bufbuild/protobuf';
import { Method } from './method.tsx';

export interface ServiceProps {
  service: ServiceType;
}

export const Service: FC<ServiceProps> = ({ service }) => {
  console.log(service);

  const name = useMemo(() => {
    const parts = service.typeName.split('.');
    return parts[parts.length - 1];
  }, [service]);

  return (
    <main className='flex flex-col gap-2'>
      <Text h3>{name}</Text>

      {Object.entries(service.methods).map(([key, method]) => (
        <Method key={`${service.typeName}.${key}`} name={key} method={method} service={service} />
      ))}
    </main>
  );
};
