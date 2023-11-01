import { FilledImage } from '../../../shared';

export default function Page() {
  return (
    <div className='flex h-[404px] flex-col items-center justify-center gap-[18px]'>
      <FilledImage src='/sandpiper-gradient.svg' alt='Sandpiper' className='h-20 w-20' />
      <p>Feature in progress... 🚧</p>
    </div>
  );
}
