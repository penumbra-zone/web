import { useEffect, useState } from 'react';
import { ChainName } from 'cosmos-kit';
import { ChainDropdown } from './chain-dropdown';

export const ChainPicker = () => {
  // Temp until slices are setup
  const [chainName, setChainName] = useState<ChainName>();
  useEffect(() => {
    console.log(`You chose: ${chainName}`);
  }, [chainName]);

  return <ChainDropdown onChange={e => setChainName(e.value)} />;
};
