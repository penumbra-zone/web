import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

export const IbcLayout = () => {
  return (
    <div className='grid md:grid-cols-3 md:gap-5'>
      <div className='col-span-1'>
        <IbcInForm />
      </div>
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
            transform: 'translateY(-25%)',
            zIndex: -1,
          }}
        />
      </div>
      <div className='col-span-1 col-start-3' style={{ marginTop: '10em' }}>
        <IbcOutForm />
      </div>
    </div>
  );
};
