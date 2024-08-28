import { Card } from '@penumbra-zone/ui/components/ui/card';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';
import { useOwnedPositions } from '../../state/swap/lp-positions.ts';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

// TODO: Ids are not sufficient in taking action on these
//       Required to move forward with this: https://github.com/penumbra-zone/penumbra/pull/4837
export const LpPositions = () => {
  const { data, error } = useOwnedPositions();

  return !data?.length ? (
    <div className='hidden xl:block'></div>
  ) : (
    <Card layout>
      <GradientHeader layout>Limit orders</GradientHeader>
      {error ? <div>❌ There was an error loading your limit orders</div> : undefined}
      {data.map(({ positionId }) => {
        const base64Id = uint8ArrayToBase64(positionId?.inner ?? new Uint8Array(0));
        return (
          <div key={base64Id} className='flex items-center gap-4 p-2'>
            {base64Id}
          </div>
        );
      })}
    </Card>
  );
};
