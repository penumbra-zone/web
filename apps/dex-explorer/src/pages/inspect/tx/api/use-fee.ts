import { useEffect, useMemo, useState } from 'react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { useRegistry, useStakingTokenMetadata } from '@/shared/api/registry';

/**
 * Takes TransactionView and extracts fee information from it
 * while augmenting fee metadata to ValueView
 */
export const useFee = (txv?: TransactionView) => {
  const { data: registry } = useRegistry();
  const { data: stakingToken } = useStakingTokenMetadata();

  const amount = useMemo(() => txv?.bodyView?.transactionParameters?.fee?.amount, [txv]);
  const defaultFee = useMemo(
    () =>
      amount &&
      new ValueView({
        valueView: {
          case: 'unknownAssetId',
          value: { amount },
        },
      }),
    [amount],
  );

  const [feeValueView, setFeeValueView] = useState<ValueView | undefined>(defaultFee);

  useEffect(() => {
    const assetId = txv?.bodyView?.transactionParameters?.fee?.assetId;
    const metadata = assetId ? registry?.tryGetMetadata(assetId) : stakingToken;
    setFeeValueView(
      metadata
        ? new ValueView({
            valueView: {
              case: 'knownAssetId',
              value: {
                amount,
                metadata,
              },
            },
          })
        : defaultFee,
    );
  }, [amount, registry, txv, stakingToken, defaultFee]);

  return feeValueView;
};
