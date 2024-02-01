import { FeeTierSelector } from '@penumbra-zone/ui';
import { InputBlock } from './input-block';
import { useStore } from '../../state';
import { sendSelector } from '../../state/send';

export const GasFee = () => {
  const { feeTier, setFeeTier } = useStore(sendSelector);

  return (
    <InputBlock label='Gas fee' value={feeTier}>
      <FeeTierSelector value={feeTier} onChange={setFeeTier} />
    </InputBlock>
  );
};
