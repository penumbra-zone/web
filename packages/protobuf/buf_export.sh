#!/bin/sh

set -x # echo on

rm -rf proto

pnpm buf export buf.build/cosmos/cosmos-sdk:e7a85cef453e4b999ad9aff8714ae05f --output proto
pnpm buf export buf.build/cosmos/ibc:7ab44ae956a0488ea04e04511efa5f70 --output proto
pnpm buf export buf.build/cosmos/ics23:55085f7c710a45f58fa09947208eb70b --output proto
pnpm buf export buf.build/penumbra-zone/penumbra:312294d02bf945ffa4c1b1dd7cd91328 --output proto
