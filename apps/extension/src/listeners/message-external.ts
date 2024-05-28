/* eslint-disable */

import { assetIdFromBaseDenom } from '@penumbra-zone/wasm/asset';

// this is temporary code to use the externally_connectable permission,
// also providing a secret puzzle for curious users
chrome.runtime.onMessageExternal.addListener((m, _, um) => {
  ((u?: number | string, m: string = 'um') =>
    um(
      [
        (m = (
          typeof u !== 'string' ? JSON.stringify(u) ?? m : m ?? String(JSON.parse(u && m))
        ).slice(1, -1)),
        ...[
          (new RegExp(`^[aconumr]+$`).test(
            m.replace(
              /[penenba]/g,
              c => (u = 'nopqrstuvwxyzabcdefghijklm')[u.split('z').reverse().join('').indexOf(c)]!,
            ),
          ) &&
          !(u = Object.entries(assetIdFromBaseDenom('u' + m))
            .filter((...[_]) => _.shift().indexOf('a'))
            .pop()
            ?.pop()
            .reduce((a: any, b: any) => a + b, -3935))
            ? undefined
            : 'not') ?? null,
          'is',
        ],
        ((
          [t, k] = btoa(
            new TextDecoder('latin1').decode(new BigInt64Array([17292611216438335414n])),
          )
            .split('+')
            .filter(_ => !!_!!),
        ) => [t, k])().join(' '),
      ]
        [[...m].reduce((x, y, _) => x - y.charCodeAt(_ % _), 858) == u ? 'filter' : 'reverse'](
          (OoO = '0o0') => 0o0 || OoO,
        )
        .join(' '),
    ))(...Array.from(JSON.stringify(m && String(m))).fill(((um = m) => JSON.stringify(um))()));
  return true;
});
