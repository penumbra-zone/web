import { useLoaderData } from 'react-router-dom';
import { Card } from '@repo/ui/components/ui/card';
import { IndexLoaderResponse } from '../fetching/loader';
import { PublicKey } from '@buf/tendermint_tendermint.bufbuild_es/tendermint/crypto/keys_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { uint8ArrayToString } from '@penumbra-zone/types/string';

const PublicKeyComponent = ({ publicKey }: { publicKey: PublicKey | undefined }) => {
  if (!publicKey) return null;

  const publicKeyType = publicKey.sum.case;
  const value = publicKey.sum.value ? uint8ArrayToHex(publicKey.sum.value) : undefined;

  return (
    <div className='flex flex-col'>
      <strong>Public Key</strong>
      <span className='ml-2'>Type: {publicKeyType}</span>
      <span className='ml-2 break-all'>Value: {value}</span>
    </div>
  );
};

export const ValidatorInfo = () => {
  const {
    status: { validatorInfo },
  } = useLoaderData() as IndexLoaderResponse;
  if (!validatorInfo) return <></>;

  return (
    // Outer div used to shrink to size instead of expand to sibling's size
    <div className='flex flex-col justify-start'>
      <Card gradient>
        <div className='flex flex-col'>
          <strong>Voting Power</strong>
          <span className='ml-2'>{validatorInfo.votingPower.toString()}</span>
        </div>
        <div className='flex flex-col'>
          <strong>Proposer Priority</strong>
          <span className='ml-2'>{validatorInfo.proposerPriority.toString()}</span>
        </div>
        <div className='flex flex-col'>
          <strong>Address</strong>
          <span className='ml-2 break-all'>{uint8ArrayToString(validatorInfo.address)}</span>
        </div>
        <PublicKeyComponent publicKey={validatorInfo.pubKey} />
      </Card>
    </div>
  );
};
