import { useStore } from '../../state';

export const PopupIndex = () => {
  const bears = useStore((state) => state.bears);

  return (
    <div>
      <h3>Great job! You caught {bears} bears</h3>
    </div>
  );
};
