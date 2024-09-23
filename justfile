# A justfile for dex-explorer development.
# Documents common tasks for local dev.

# build container image
container:
  podman build -f Containerfile .
