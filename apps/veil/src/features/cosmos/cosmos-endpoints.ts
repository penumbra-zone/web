// Multiple RPC endpoints for each chain for failover
export const RPC_ENDPOINTS: Record<string, string[]> = {
  // ====================
  //  Mainnets
  // ====================
  // Axelar mainnet (axelar-dojo-1)
  'axelar-dojo-1': [
    'https://rpc-axelar.imperator.co:443',
    'https://axelar-rpc.pops.one:443',
    'https://axelar-rpc.qubelabs.io:443',
    'https://rpc-1.axelar.nodes.guru:443',
    'https://axelar-rpc.polkachu.com',
    'https://rpc.axelar.bh.rocks',
    'https://axelar.rpc.quantnode.xyz/',
    'https://axelar-rpc.rockrpc.net/',
    'https://axelar-rpc.ibs.team',
    'https://rpc-axelar-01.stakeflow.io',
    'https://axelar-rpc.staketab.org:443',
    'https://axelar-rpc.publicnode.com:443',
    'https://axelar.drpc.org',
  ],
  // Celestia mainnet (celestia)
  celestia: [
    'https://public-celestia-rpc.numia.xyz',
    'https://rpc.lunaroasis.net',
    'https://rpc.celestia.nodestake.org',
    'https://rpc-celestia-01.stakeflow.io',
    'https://celestia-rpc.publicnode.com:443',
    'https://celestia.rpc.kjnodes.com',
    'https://celestia-rpc.polkachu.com',
    'https://rpc-celestia.mzonder.com',
    'https://rpc.celestia.validatus.com',
    'https://celestia.cumulo.org.es/',
    'https://celestia-rpc.stake-town.com',
    'https://celestia-rpc.noders.services',
    'https://rpc.celestia.citizenweb3.com',
    'https://celestia-mainnet-rpc.itrocket.net',
    'https://rpc.celestia.mainnet.dteam.tech:443',
    'https://celestia-rpc.stakeandrelax.net',
    'https://rpc.celestia.node75.org',
  ],
  // Cosmos Hub mainnet (cosmoshub-4)
  'cosmoshub-4': [
    'https://cosmoshub.tendermintrpc.lava.build:443',
    'https://rpc-cosmoshub.ecostake.com',
    'https://cosmos-rpc.polkachu.com',
    'https://rpc.cosmos.dragonstake.io',
    'https://rpc.cosmos.bh.rocks',
    'https://cosmos-rpc.easy2stake.com/',
    'https://rpc.cosmos.nodestake.org',
    'https://cosmos-rpc.publicnode.com:443',
    'https://cosmoshub.rpc.kjnodes.com',
    'https://rpc-cosmos-hub-01.stakeflow.io',
    'https://cosmos-rpc.w3coins.io',
    'https://community.nuxian-node.ch:6797/gaia/trpc',
    'https://cosmoshub-rpc.cosmosrescue.dev',
    'https://rpc.cosmoshub-4.citizenweb3.com',
    'https://cosmos-rpc.stakeandrelax.net',
    'https://cosmos-hub.drpc.org',
    'https://cosmoshub-mainnet-rpc.itrocket.net',
    'https://cosmoshub.rpc.quasarstaking.ai',
    'https://cosmos-rpc.ibs.team',
    'https://rpc.cosmoshub-4-archive.citizenweb3.com:443',
  ],
  // dYdX mainnet (dydx-mainnet-1)
  'dydx-mainnet-1': [
    'https://dydx-rpc.kingnodes.com:443',
    'https://dydx-dao-rpc.polkachu.com',
    'https://rpc-dydx.ecostake.com:443',
    'https://dydx-rpc.publicnode.com:443',
  ],
  // Injective mainnet (injective-1)
  'injective-1': [
    'https://injective-rpc.polkachu.com',
    'https://rpc-injective-01.stakeflow.io',
    'https://injective-rpc.publicnode.com:443',
  ],
  // Neutron mainnet (neutron-1)
  'neutron-1': [
    'https://rpc-lb.neutron.org',
    'https://rpc-vertexa.neutron-1.neutron.org',
    'https://rpc-voidara.neutron-1.neutron.org',
    'https://rpc-pulsarix.neutron-1.neutron.org',
    'https://neutron-rpc.publicnode.com:443',
    'https://rpc.neutron.quokkastake.io',
  ],
  // Noble mainnet (noble-1)
  'noble-1': ['https://noble-rpc.polkachu.com', 'https://noble-rpc.owallet.io'],
  // Osmosis mainnet (osmosis-1)
  'osmosis-1': [
    'https://rpc-osmosis.ecostake.com',
    'https://osmosis-rpc.polkachu.com',
    'https://osmosis.rpc.stakin-nodes.com',
    'https://rpc-osmosis-01.stakeflow.io',
    'https://osmosis-rpc.publicnode.com:443',
    'https://community.nuxian-node.ch:6797/osmosis/trpc',
    'https://osmosis-rpc.stake-town.com',
    'https://rpc.osmosis.validatus.com',
    'https://rpc.osmosis.bronbro.io:443',
    'https://rpc.cros-nest.com/osmosis',
    'https://osmosis-rpc.noders.services',
    'https://osmosis.drpc.org',
    'https://osmosis-rpc.chainroot.io',
  ],
  // Stride mainnet (stride-1)
  'stride-1': [
    'https://stride-rpc.polkachu.com/',
    'https://stride.rpc.kjnodes.com',
    'https://rpc-stride-01.stakeflow.io',
    'https://stride-rpc.publicnode.com:443',
    'https://community.nuxian-node.ch:6797/stride/trpc',
    'https://stride-rpc.stakeandrelax.net',
    'https://stride-rpc.ibs.team',
    'https://stride.rpc.quasarstaking.ai:443',
  ],

  // ====================
  //  Testnets
  // ====================
  // Noble testnet (grand-1)
  'grand-1': ['https://noble-testnet-rpc.polkachu.com'],
  // Osmosis testnet (osmo-test-5)
  'osmo-test-5': ['https://rpc.osmotest5.osmosis.zone/'],
};
