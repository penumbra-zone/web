import { MinifrontVersion } from './minifront-version';
import { RightsMessage } from './rights-message';

export const Footer = () => (
  <footer className='w-full bg-gradient-to-b from-transparent to-black to-40% pt-[3em]'>
    <div className='text-center text-stone-700 hover:text-stone-600'>
      <RightsMessage />
      <MinifrontVersion />
    </div>
  </footer>
);
