# Publishing Extension

Publishing a new version of the extension should be a very careful process.
The extension is a hot wallet and custodies the user's encrypted seed phrase.
If the publishing pipeline was compromised, a bad actor could upload malicious code.

### Access to publish

#### #1 - Penumbra Labs [google group](https://groups.google.com/a/penumbralabs.xyz/g/chrome-extension-publishers)

This entity is a [group publisher](https://developer.chrome.com/docs/webstore/group-publishers/). Members of the
group have publish permissions. Note: For a group member to publish updates, that member must register as a Chrome Web Store developer and pay the one-time registration fee.
Package uploads are done through the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).

#### #2 - Github CI/CD

Upon a github release, the `penumbra-zone/penumbra-labs` github team will be pinged for a review of the release.
Any one of the members can approve it. Upon doing so, the pipeline will trigger packaging and publishing the extension code for the main branch.
See github action [here](../.github/workflows/extension-publish.yml).

The credentials for this have been generated in the [penumbra-web google cloud project](https://console.cloud.google.com/apis/credentials?project=penumbra-web&supportedpurview=project).
If the one who generated the credentials has been removed from the ownership google group (from #1 above),
new credentials need to be generated for the [ext-publish](https://github.com/penumbra-zone/web/settings/environments/1654975857/edit) github environment:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REFRESH_TOKEN

These can be generated by following the [chrome webstore api guide](https://developer.chrome.com/docs/webstore/using_webstore_api/).

Note: there is a Chrome review process that typically takes 1-2 days.
