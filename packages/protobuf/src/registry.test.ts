import { describe, expect, it } from 'vitest';
import { MsgRecvPacketSchema } from '../gen/ibc/core/channel/v1/tx_pb.js';
import { MsgUpdateClientSchema } from '../gen/ibc/core/client/v1/tx_pb.js';
import {
  ClientStateSchema,
  HeaderSchema,
} from '../gen/ibc/lightclients/tendermint/v1/tendermint_pb.js';
import { DutchAuctionSchema } from '../gen/penumbra/core/component/auction/v1/auction_pb.js';
import { ValidatorInfoSchema } from '../gen/penumbra/core/component/stake/v1/stake_pb.js';
import { BalancesResponseSchema } from '../gen/penumbra/view/v1/view_pb.js';
import { typeRegistry } from './registry.js';

describe('registry contents that are part of services', () => {
  it('includes ValidatorInfo', () => {
    expect(typeRegistry.get(ValidatorInfoSchema.typeName)).toBeTruthy();
  });

  it('includes MsgUpdateClient', () => {
    expect(typeRegistry.get(MsgUpdateClientSchema.typeName)).toBeTruthy();
  });
});

describe('registry contents that are not part of services', () => {
  it('includes ClientState', () => {
    expect(typeRegistry.get(ClientStateSchema.typeName)).toBeTruthy();
  });

  it('includes Header', () => {
    expect(typeRegistry.get(HeaderSchema.typeName)).toBeTruthy();
  });

  it('includes MsgRecvPacket', () => {
    expect(typeRegistry.get(MsgRecvPacketSchema.typeName)).toBeTruthy();
  });

  it('includes DutchAuction', () => {
    expect(typeRegistry.get(DutchAuctionSchema.typeName)).toBeTruthy();
  });
});

describe('registry contents that are important for noble ibc', () => {
  it('includes BalancesResponse', () => {
    expect(typeRegistry.get(BalancesResponseSchema.typeName)).toBeTruthy();
  });
});
