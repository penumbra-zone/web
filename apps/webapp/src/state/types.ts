import { AssetBalance } from '../fetchers/balances';

export interface Selection {
  address: string | undefined;
  accountIndex: number | undefined;
  asset: AssetBalance | undefined;
}
