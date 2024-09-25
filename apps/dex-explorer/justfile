# A justfile for dex-explorer development.
# Documents common tasks for local dev.

# run the app locally with live reload, via pnpm
dev:
  pnpm install
  pnpm dev

# build container image
container:
  podman build -f Containerfile .
