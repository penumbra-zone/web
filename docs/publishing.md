# Publishing Extension

Publishing a new version of the extension should be a very careful process.
The extension is a hot wallet and custodies the user's encrypted seed phrase.
If the publishing pipeline was compromised, a bad actor could upload malicious code.

### Access to publish

#1 - Penumbra Labs [google group](https://groups.google.com/a/penumbralabs.xyz/g/chrome-extension-publishers).
This entity is a [group publisher](https://developer.chrome.com/docs/webstore/group-publishers/). Members of the
group have publish permissions. Note: For a group member to publish updates, that member must register as a Chrome Web Store developer and pay the one-time registration fee.

#2 - Github CI/CD
Upon a github release, the pipeline will trigger packaging and publishing the extension code for the main branch.
The credentials for the have been generated in the [penumbra-web google cloud project](https://console.cloud.google.com/apis/credentials?project=penumbra-web&supportedpurview=project).
See github action [here](../.github/workflows/extension-publish.yml).
