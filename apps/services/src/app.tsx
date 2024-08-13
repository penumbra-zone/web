import { FC } from 'react';
import { Header } from './components/header';

export const App: FC = () => {
  return (
    <div className='mx-auto px-2 md:px-4 lg:px-8'>
      <Header />
    </div>
  );
};
