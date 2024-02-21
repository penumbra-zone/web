# Penumbra node status page

![Screenshot 2024-02-22 at 1 21 54 PM](https://github.com/penumbra-zone/web/assets/16624263/7422ff48-fe33-4f16-a13f-4e109998c7ec)

### Overview

This static site serves as a status page for the Penumbra node,
displaying output from [GetStatus](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.util.tendermint_proxy.v1#penumbra.util.tendermint_proxy.v1.TendermintProxyService.GetStatus) rpc method
and linking to minifront. Designed to be hosted by PD.

### Run

```
pnpm install
pnpm dev # for local development

pnpm build # for getting build output for deployment on pd
```
