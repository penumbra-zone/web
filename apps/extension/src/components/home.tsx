import { Button } from '@ui/components/ui/button';
import { useStore } from '../stores';

export const Home = () => {
  const bears = useStore((state) => state.bears);
  const fishes = useStore((state) => state.fishes);
  const addBear = useStore((state) => state.addBear);
  const addFish = useStore((state) => state.addFish);
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
        <h2>Number of bears: {bears}</h2>
        <h2>Number of fishes: {fishes}</h2>
        <Button
          onClick={() => {
            addBear();
          }}
        >
          Add a bear
        </Button>

        <Button
          onClick={() => {
            addFish();
          }}
        >
          Add a fish
        </Button>
      </div>
    </>
  );
};
