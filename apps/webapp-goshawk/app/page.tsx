import { Button, Header } from 'ui';

export default function Page() {
  return (
    <>
      <Header text='Web' />
      <button className='rounded bg-blue-500 px-4 py-2 text-red-500'>In app button</button>
      <button className='bg-amber-600 p-8'>App defaults</button>
      <button className='bg-blue p-8'>App custom</button>
      <Button />
    </>
  );
}
