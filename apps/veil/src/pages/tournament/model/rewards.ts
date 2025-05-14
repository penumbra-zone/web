import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

/**
 * What a user voted for, and what power they had / have.
 */
export interface Vote {
  /** What share of the voting power this vote represents. */
  share: number;
  /** The asset voted for. */
  asset: AssetId;
}

/**
 * A single reward given to a delegator.
 */
export interface DelegatorReward {
  /** The epoch in which this reward was allocated. */
  epoch: number;
  /** The reward is a certain number of tokens.
   *
   * In practice, this will always be denominated in the staking token.
   */
  value: Value;
  /** The vote being rewarded. */
  vote: Vote;
}
