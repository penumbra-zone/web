import { VeilVersion } from './veil-version';

export const Footer = () => {
  return (
    <footer className='mt-auto border-t border-t-other-solid-stroke px-6 py-4'>
      <div className='flex justify-center'>
        <VeilVersion />
      </div>
    </footer>
  );
};
