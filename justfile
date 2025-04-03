# Build top-level debug container
container:
  fd -t d node_modules --no-ignore -X rm -r
  fd -t d target --no-ignore -X rm -r
  @just veil-container
  podman image ls | rg veil

# Run dev-env for Veil DEX explorer app
veil:
  cd ./apps/veil && just dev

# Build container for Veil app
veil-container:
  cd ./apps/veil && just container
