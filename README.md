# DEX explorer for Penumbra

A DEX explorer for [Penumbra](https://penumbra.zone/).

## Getting Started

TK. Although the docs at https://github.com/penumbra-zone/cuiloa may be useful.

### Penumbra node setup

You need to have a full node setup with penumbra (including `cometbft`) as detailed [here for testnets](https://guide.penumbra.zone/main/pd/join-testnet.html#joining-a-testnet).
Alternatively, you can configure a full node on a devnet as explained [here](https://guide.penumbra.zone/main/dev/devnet-quickstart.html).
**In either case**, you need to modify the `config.toml` file that is created by `pd` after generating your configuration files.

`config.toml` should be found under `$HOME/.penumbra/testnet_data/node0/cometbft/config/`. In this file, there is a heading `[tx_index]` with the configuration variable of `indexer = "kv"`.
Using the URI of the database you created with PostgreSQL from the previous section, you need to update the section under `[tx_index]` to the following:

```toml
[tx_index]
indexer = "psql"
psql-conn = "$YOUR_DB_URI_HERE"
```
After you have updated this file, you should start the full node as instructed by the Penumbra guide.
If everything was configured correctly, you should be able to open the database and inspect for Block and Transaction events.
If there is no data, check the logs for `cometbft` for any errors with inserting data into the indexer.


## Deployment

Merges to main will automatically build a container, hosted at `ghcr.io/penumbra-zone/dex-explorer`.
In order to run the dex-explorer, you'll need to [deploy a Penumbra fullnode](https://guide.penumbra.zone/node/pd/running-node),
with [ABCI event indexing enabled](https://guide.penumbra.zone/node/pd/indexing-events). The relevant env vars
you'll want to set are:

  * `PENUMBRA_GRPC_ENDPOINT`: the URL to a remote node's `pd` gRPC service
  * `PENUMBRA_INDEXER_ENDPOINT`: the URL to a Postgre database containing ABCI events
  * `PENUMBRA_INDEXER_CA_CERT`: optional; if set, the database connection will use the provided certificate authority when validating TLS
  * `NEXT_PUBLIC_CHAIN_ID`: the chain id for the network being indexed, controls asset-registry lookups
  * `NEXT_PUBLIC_CUILOA_URL`: the URL for a block-explorer application, for generating URLs for more block/transaction info

## Name

It'd be nice to have a cool name for the DEX explorer. We don't have one yet.


## Proto Generation
Using https://buf.build/penumbra-zone/penumbra/sdks/main
