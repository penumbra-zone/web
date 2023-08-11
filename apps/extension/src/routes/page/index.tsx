import { Button } from '@ui/components/ui/button';

export const PageIndex = () => {
  return (
    <>
      <h1 className='bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent'>
        Welcome to Penumbra
      </h1>
      <Button
      // onClick={async () => {
      //   await chrome.storage.session.set({ password: 'xyz' });
      // }}
      >
        Set password
      </Button>

      <div>
        <h2>Number of bears: </h2>

        <Button>Add a salmon</Button>
      </div>
    </>
  );
};
