import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

export const IbcLayout = () => {
  return (
    <div className='my-5 grid grid-cols-3 gap-5' style={{ gridTemplateRows: '8em auto 8em' }}>
      <div className='col-span-1 row-span-2'>
        <IbcInForm />
      </div>
      <div className='col-span-2 row-span-1'>{/*→*/}</div>
      <div
        className='col-span-1 self-center overflow-visible'
        style={{ height: 0, marginBottom: 'auto' }}
      >
        <img
          src='./penumbra-logo.svg'
          alt='Penumbra logo'
          style={{
            maxWidth: 'none',
            width: '400%',
            position: 'relative',
            transform: 'translateY(-40%)',
            zIndex: -1,
          }}
        />
      </div>
      <div className='col-span-1 row-span-2 col-start-3'>
        <IbcOutForm />
      </div>
      <div className='col-span-2 row-span-1'>{/* ← */}</div>
    </div>
  );
};
