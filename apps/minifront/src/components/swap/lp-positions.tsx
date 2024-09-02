import { Card } from '@penumbra-zone/ui/components/ui/card';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';
import { useOwnedPositions } from '../../state/swap/lp-positions.ts';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/value';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

const stateToString = (state?: PositionState_PositionStateEnum): string => {
  switch (state) {
    case PositionState_PositionStateEnum.UNSPECIFIED: {
      return 'UNSPECIFIED';
    }
    case PositionState_PositionStateEnum.OPENED: {
      return 'OPENED';
    }
    case PositionState_PositionStateEnum.CLOSED: {
      return 'CLOSED';
    }
    case PositionState_PositionStateEnum.WITHDRAWN: {
      return 'WITHDRAWN';
    }
    case PositionState_PositionStateEnum.CLAIMED: {
      return 'CLAIMED';
    }
    case undefined: {
      return 'UNSPECIFIED';
    }
  }
};

export const LpPositions = () => {
  const { data, error } = useOwnedPositions();

  return !data?.length ? (
    <div className='hidden xl:block' />
  ) : (
    <Card layout>
      <GradientHeader layout>Limit orders</GradientHeader>
      {!!error && <div>❌ There was an error loading your limit orders: ${String(error)}</div>}
      {data.map(({ position, id, r1ValueView, r2ValueView }) => {
        const bech32Id = bech32mPositionId(id);
        const base64Id = uint8ArrayToBase64(id.inner);
        return (
          <div key={bech32Id} className='flex flex-col items-center gap-4 p-2'>
            <div>{bech32Id}</div>
            <div>{base64Id}</div>
            <div>{stateToString(position.state?.state)}</div>

            <ValueViewComponent view={r1ValueView} />
            <ValueViewComponent view={r2ValueView} />

            {/* <div>{position.state?.sequence ? position.state.sequence.toString() : '0'}</div>*/}

            <div className='truncate'>
              {!!position.phi?.component?.fee && position.phi.component.fee}
            </div>

            {/* <div>{uint8ArrayToBase64(position.nonce)}</div>*/}

            {/* <div>{position.closeOnFill ? 'true' : 'false'}</div>*/}

            {/* <div>*/}
            {/*  {position.phi?.component?.p && joinLoHiAmount(position.phi.component.p).toString()}*/}
            {/* </div>*/}

            {/* <div>*/}
            {/*  {position.phi?.component?.q && joinLoHiAmount(position.phi.component.q).toString()}*/}
            {/* </div>*/}

            {/* <div>{position.reserves?.r1 && joinLoHiAmount(position.reserves.r1).toString()}</div>*/}

            {/* <div>{position.reserves?.r2 && joinLoHiAmount(position.reserves.r2).toString()}</div>*/}
          </div>
        );
      })}
    </Card>
  );
};
