# Run dev-env for Veil DEX explorer app
veil:
  cd ./apps/veil && just dev

# Build container for Veil app
veil-container:
  cd ./apps/veil && just container
