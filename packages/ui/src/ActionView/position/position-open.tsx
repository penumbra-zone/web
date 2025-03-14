import { useMemo } from 'react';
import { create } from '@bufbuild/protobuf';
import { PositionOpen } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueViewSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '../../ValueView';
import { AssetGroup } from '../../AssetIcon';
import { Density } from '../../Density';
import { Pill } from '../../Pill';
import { Text } from '../../Text';
import { ActionViewBaseProps } from '../types';
import { ActionWrapper } from '../shared/wrapper';
import { ActionRow } from '../shared/action-row';

export interface PositionOpenActionProps extends ActionViewBaseProps {
  value: PositionOpen;
}

export const PositionOpenAction = ({ value, getMetadataByAssetId }: PositionOpenActionProps) => {
  const asset1 = useMemo(() => {
    const id = value.position?.phi?.pair?.asset1;
    return id ? getMetadataByAssetId?.(id) : undefined;
  }, [value, getMetadataByAssetId]);

  const asset2 = useMemo(() => {
    const id = value.position?.phi?.pair?.asset2;
    return id ? getMetadataByAssetId?.(id) : undefined;
  }, [value, getMetadataByAssetId]);

  // TODO: find a way to compute positionId without WASM functions
  const positionId = useMemo(() => {
    return '';
  }, []);

  const r1 = useMemo(() => {
    if (!value.position?.reserves?.r1?.lo) {
      return undefined;
    }
    return create(ValueViewSchema, {
      valueView: asset1
        ? {
            case: 'knownAssetId',
            value: {
              metadata: asset1,
              amount: value.position.reserves.r1,
            },
          }
        : {
            case: 'unknownAssetId',
            value: {
              amount: value.position.reserves.r1,
              assetId: value.position.phi?.pair?.asset1,
            },
          },
    });
  }, [asset1, value]);

  const r2 = useMemo(() => {
    if (!value.position?.reserves?.r2?.lo) {
      return undefined;
    }
    return create(ValueViewSchema, {
      valueView: asset2
        ? {
            case: 'knownAssetId',
            value: {
              metadata: asset2,
              amount: value.position.reserves.r2,
            },
          }
        : {
            case: 'unknownAssetId',
            value: {
              amount: value.position.reserves.r2,
              assetId: value.position.phi?.pair?.asset2,
            },
          },
    });
  }, [asset2, value]);

  return (
    <ActionWrapper
      title='Position Open'
      infoRows={
        <>
          {positionId && <ActionRow label='Position ID' info={positionId} />}

          <Density slim>
            {r1 && (
              <ActionRow
                label='Reserves'
                info={<ValueViewComponent valueView={r1} priority='tertiary' showIcon={false} />}
              />
            )}
            {r2 && (
              <ActionRow
                label='Reserves'
                info={<ValueViewComponent valueView={r2} priority='tertiary' showIcon={false} />}
              />
            )}
          </Density>

          {!!value.position?.phi?.component?.fee && (
            <ActionRow label='Fee' info={value.position.phi.component.fee} />
          )}
        </>
      }
    >
      <Pill>
        <AssetGroup assets={[asset1, asset2]} variant='split' />
        <span />
        <Text detailTechnical>
          {asset1?.symbol}
          {!!asset1 && !!asset2 && '/'}
          {asset2?.symbol}
        </Text>
      </Pill>
    </ActionWrapper>
  );
};
