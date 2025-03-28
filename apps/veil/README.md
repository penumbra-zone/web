# DEX explorer for Penumbra

A DEX explorer for [Penumbra](https://penumbra.zone/).

## Getting Started

The application is written in [NextJS], and uses [pnpm] for package management.
The fastest way to get started on the development environment is to use [Nix]:

```shell
sh <(curl -L https://nixos.org/nix/install)
nix develop
just dev
```

However, you still need a database to connect to.

## Connecting to a database

The DEX explorer application requires a PostgreSQL database containing ABCI event information
as written by [pindexer].
You can set up a local devnet by following the [Penumbra devnet quickstart guide](https://guide.penumbra.zone/dev/devnet-quickstart),
or plug in credentials for an already running database via environment variables:

```
# add these to e.g. `.envrc`:
export PENUMBRA_GRPC_ENDPOINT="https://testnet.plinfra.net"
export PENUMBRA_INDEXER_ENDPOINT="postgresql://<PGUSER>:<PGPASS>@<PGHOST>:<PGPORT>/<PGDATABASE>?sslmode=require""
export PENUMBRA_CHAIN_ID="penumbra-testnet-phobos-2"
# optional: if you see "self-signed certificate in certificate chain" errors,
# you'll likely need to export a `ca-cert.pem` file for the DB TLS.
# export PENUMBRA_INDEXER_CA_CERT="$(cat ca-cert.pem)"
```

If you see an error `self-signed certificate in certificate chain`, then you'll need to:

1. obtain the CA certificate file for the backend database you're connecting to, and export it as `PENUMBRA_INDEXER_CA_CERT`.
2. _remove_ the `sslmode=require` string on the `PENUMBRA_INDEXER_ENDPOINT` var.

See context in #55. After configuring that information, run `just dev` again in the nix shell, and you should have events visible.

## Deployment

Merges to main will automatically build a container, hosted at `ghcr.io/penumbra-zone/veil`.
In order to run the veil, you'll need to [deploy a Penumbra fullnode](https://guide.penumbra.zone/node/pd/running-node),
with [ABCI event indexing enabled](https://guide.penumbra.zone/node/pd/indexing-events). The relevant env vars
you'll want to set are:

- `PENUMBRA_GRPC_ENDPOINT`: the URL to a remote node's `pd` gRPC service
- `PENUMBRA_INDEXER_ENDPOINT`: the URL to a Postgre database containing ABCI events
- `PENUMBRA_INDEXER_CA_CERT`: optional; if set, the database connection will use the provided certificate authority when validating TLS
- `PENUMBRA_CHAIN_ID`: the chain id for the network being indexed, controls asset-registry lookups
- `PENUMBRA_CUILOA_URL`: the URL for a block-explorer application, for generating URLs for more block/transaction info

## Name

It'd be nice to have a cool name for the DEX explorer. We don't have one yet.

## Proto Generation

Using https://buf.build/penumbra-zone/penumbra/sdks/main

## Code structure

Read the sub-article about the code structure [here](./pages/readme.md).

[NextJS]: https://nextjs.org/
[Nix]: https://nixos.org/download/
[pindexer]: https://guide.penumbra.zone/node/pd/indexing-events#using-pindexer
[pnpm]: https://pnpm.io/
