import { BlockProcessor } from 'penumbra-query';
import { IndexedDb } from 'penumbra-indexed-db';
import { ObliviousQuerier } from 'penumbra-query/src/oblivious';
import { SpecificQuerier } from 'penumbra-query/src/specific';
import { getAddressByIndex, ViewServer } from 'penumbra-wasm-ts';

// TODO upcoming PR: constants should set via popup network setting
//                   initializeServiceWorker() should be prompted to run from popup if account is available
const constants = {
  grpcEndpoint: 'https://grpc.testnet.penumbra.zone',
  indexedDbVersion: 12,
};

const initializeServiceWorker = async () => {
  const oblQuerier = new ObliviousQuerier({ grpcEndpoint: constants.grpcEndpoint });
  const specQuerier = new SpecificQuerier({ grpcEndpoint: constants.grpcEndpoint });

  const tempFullViewKey =
    'penumbrafullviewingkey1qjr5suw82hz2tl9jpmurzj7vlc4vwp3zlsc6007c4ckrlmg7nvx567v3mekx4ugf9l6wnmhrw7y6602vrp8ehhw0axxud4saywy4yrsu3masu';

  const { chainId, epochDuration } = await oblQuerier.chainParameters();
  const indexedDb = await IndexedDb.initialize({
    chainId,
    accountAddr: getAddressByIndex(tempFullViewKey, 0),
    dbVersion: constants.indexedDbVersion,
  });

  const viewServer = new ViewServer({
    fullViewingKey: tempFullViewKey,
    epochDuration,
    getStoredTree: () => indexedDb.loadStoredTree(),
  });

  const client = new BlockProcessor({
    viewServer,
    specQuerier,
    oblQuerier,
    indexedDb,
  });

  await client.syncBlocks();
};

void initializeServiceWorker();
