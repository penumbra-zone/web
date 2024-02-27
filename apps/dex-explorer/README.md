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


## CI

Merges to main will automatically build a container and deploy to a publicly accessible URL.
Each deploy of the application has its own Penumbra fullnode sidecar, with CometBFT indexing enabled.
The URLs are:

  * https://dex-explorer.testnet.penumbra.zone
  * https://dex-explorer.testnet-preview.penumbra.zone

The "testnet" environment is the public stable testnet with active community participation.
The "preview" environment is a shorter-lived chain, rebuilt from the tip of `main` merge
on the [Penumbra monorepo](https://github.com/penumbra-zone/penumbra). As such, it changes
several times per day, and generally has less information on its chain.

## Name

It'd be nice to have a cool name for the DEX explorer. We don't have one yet.


## Proto Generation
Using https://buf.build/penumbra-zone/penumbra/sdks/main