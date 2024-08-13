import { FC } from 'react';
import { ViewService } from '@penumbra-zone/protobuf';

import { Header } from './components/header';
import { Service } from './components/service';

export const App: FC = () => {
  return (
    <div className='mx-auto px-2 md:px-4 lg:px-8'>
      <Header />

      <Service service={ViewService} />
    </div>
  );
};
