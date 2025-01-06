/* eslint-disable -- copied from cosmos-kit */
// @ts-nocheck

// cosmos-kit has a dependency issue with @hexxagon/feather.js@1.0.11:
// https://github.com/cosmology-tech/cosmos-kit/issues/526
// this file is a copy of the cosmos-kit/wallets.js file, but with the
// @hexxagon/feather.js dependency removed.

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.wallets =
  exports.createAllWalletList =
  exports.defineGetters =
  exports.cdcwallet =
  exports.galaxystation =
  exports.owallet =
  exports.tailwind =
  exports.exodus =
  exports.compass =
  exports.coin98 =
  exports.shell =
  exports.omni =
  exports.fin =
  exports.frontier =
  exports.vectis =
  exports.xdefi =
  exports.trust =
  exports.okxwallet =
  exports.station =
  exports.leap =
  exports.ledger =
  exports.cosmostation =
  exports.keplr =
  exports.createWalletList =
    void 0;
const coin98_extension_1 = require('@cosmos-kit/coin98-extension');
const compass_extension_1 = require('@cosmos-kit/compass-extension');
const okxwallet_extension_1 = require('@cosmos-kit/okxwallet-extension');
const cosmostation_extension_1 = require('@cosmos-kit/cosmostation-extension');
const cosmostation_mobile_1 = require('@cosmos-kit/cosmostation-mobile');
const frontier_extension_1 = require('@cosmos-kit/frontier-extension');
const keplr_extension_1 = require('@cosmos-kit/keplr-extension');
const keplr_mobile_1 = require('@cosmos-kit/keplr-mobile');
const owallet_extension_1 = require('@cosmos-kit/owallet-extension');
const leap_extension_1 = require('@cosmos-kit/leap-extension');
const leap_mobile_1 = require('@cosmos-kit/leap-mobile');
const leap_metamask_cosmos_snap_1 = require('@cosmos-kit/leap-metamask-cosmos-snap');
const ledger_1 = require('@cosmos-kit/ledger');
const omni_mobile_1 = require('@cosmos-kit/omni-mobile');
const fin_extension_1 = require('@cosmos-kit/fin-extension');
const station_extension_1 = require('@cosmos-kit/station-extension');
const trust_extension_1 = require('@cosmos-kit/trust-extension');
const trust_mobile_1 = require('@cosmos-kit/trust-mobile');
const shell_extension_1 = require('@cosmos-kit/shell-extension');
const vectis_extension_1 = require('@cosmos-kit/vectis-extension');
const xdefi_extension_1 = require('@cosmos-kit/xdefi-extension');
const exodus_extension_1 = require('@cosmos-kit/exodus-extension');
const tailwind_1 = require('@cosmos-kit/tailwind');
// const galaxy_station_extension_1 = require("@cosmos-kit/galaxy-station-extension");
const cdcwallet_extension_1 = require('@cosmos-kit/cdcwallet-extension');
function createWalletList(extension, mobile, snap) {
  const list = [extension, mobile, snap].filter(wallet => Boolean(wallet));
  list.mobile = mobile;
  list.extension = extension;
  return list;
}
exports.createWalletList = createWalletList;
exports.keplr = createWalletList(keplr_extension_1.wallets[0], keplr_mobile_1.wallets[0]);
exports.cosmostation = createWalletList(
  cosmostation_extension_1.wallets[0],
  cosmostation_mobile_1.wallets[0],
);
exports.ledger = ledger_1.wallets;
exports.leap = createWalletList(
  leap_extension_1.wallets[0],
  leap_mobile_1.wallets[0],
  leap_metamask_cosmos_snap_1.wallets[0],
);
exports.station = createWalletList(station_extension_1.wallets[0], null);
exports.okxwallet = createWalletList(okxwallet_extension_1.wallets[0], null);
exports.trust = createWalletList(trust_extension_1.wallets[0], trust_mobile_1.wallets[0]);
exports.xdefi = createWalletList(xdefi_extension_1.wallets[0], null);
exports.vectis = createWalletList(vectis_extension_1.wallets[0], null);
exports.frontier = createWalletList(frontier_extension_1.wallets[0], null);
exports.fin = createWalletList(fin_extension_1.wallets[0], null);
exports.omni = createWalletList(null, omni_mobile_1.wallets[0]);
exports.shell = createWalletList(shell_extension_1.wallets[0], null);
exports.coin98 = createWalletList(coin98_extension_1.wallets[0], null);
exports.compass = createWalletList(compass_extension_1.wallets[0], null);
exports.exodus = createWalletList(exodus_extension_1.wallets[0], null);
exports.tailwind = createWalletList(tailwind_1.wallets[0], null);
exports.owallet = createWalletList(owallet_extension_1.wallets[0], null);
// exports.galaxystation = createWalletList(galaxy_station_extension_1.wallets[0], null);
exports.cdcwallet = createWalletList(cdcwallet_extension_1.wallets[0], null);
function defineGetters(wallets) {
  return Object.defineProperties(wallets, {
    mobile: {
      get() {
        return this.filter(wallet => wallet.isModeWalletConnect);
      },
    },
    extension: {
      get() {
        return this.filter(wallet => wallet.isModeExtension);
      },
    },
  });
}
exports.defineGetters = defineGetters;
function createAllWalletList(ws) {
  const wallets = ws.slice();
  wallets.keplr = exports.keplr;
  wallets.cosmostation = exports.cosmostation;
  wallets.ledger = exports.ledger;
  wallets.okxwallet = exports.okxwallet;
  wallets.station = exports.station;
  wallets.leap = exports.leap;
  wallets.trust = exports.trust;
  wallets.xdefi = exports.xdefi;
  wallets.vectis = exports.vectis;
  wallets.frontier = exports.frontier;
  wallets.fin = exports.fin;
  wallets.omni = exports.omni;
  wallets.coin98 = exports.coin98;
  wallets.compass = exports.compass;
  wallets.exodus = exports.exodus;
  wallets.tailwind = exports.tailwind;
  wallets.owallet = exports.owallet;
  wallets.galaxystation = exports.galaxystation;
  wallets.cdcwallet = exports.cdcwallet;
  defineGetters(wallets);
  wallets.for = function (...ns) {
    const names = Array.from(new Set(ns));
    return defineGetters(
      names.map(name => wallets.filter(wallet => wallet.walletInfo.name.startsWith(name))).flat(),
    );
  };
  wallets.not = function (...ns) {
    const names = Array.from(new Set(ns));
    return defineGetters(
      wallets.filter(wallet => !names.some(name => wallet.walletInfo.name.startsWith(name))),
    );
  };
  return wallets;
}
exports.createAllWalletList = createAllWalletList;
exports.wallets = createAllWalletList([
  ...exports.keplr,
  ...exports.leap,
  ...exports.ledger,
  ...exports.okxwallet,
  ...exports.station,
  ...exports.trust,
  ...exports.cosmostation,
  ...exports.xdefi,
  ...exports.vectis,
  ...exports.frontier,
  ...exports.fin,
  ...exports.omni,
  ...exports.coin98,
  ...exports.compass,
  ...exports.exodus,
  ...exports.tailwind,
  ...exports.owallet,
  ...exports.galaxystation,
  ...exports.cdcwallet,
]);
