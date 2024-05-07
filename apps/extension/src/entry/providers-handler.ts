const requestAnnouncementListener = async (ev: MessageEvent<unknown>) => {
  console.log('providers ev', ev);
  if (window.top && ev.origin && ev.data === 'penumbra') {
    const penumbra = Object.fromEntries(
      (await chrome.cookies.getAll({ domain: 'penumbra.zone.invalid' })).map(({ value, name }) => [
        name,
        value,
      ]),
    );
    console.log('providing penumbra', penumbra);
    window.top.postMessage({ penumbra }, ev.origin);
    window.removeEventListener('message', requestAnnouncementListener);
  }
};

window.addEventListener('message', requestAnnouncementListener);
