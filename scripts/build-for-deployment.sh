#!/usr/bin/env bash

# Runs `pnpm build`, then zips the `dist` directories for both minifront and
# node-status so that they can be PRed to the core repo.
#
# Usage:
# sh ./scripts/build-for-deployment -o /tmp
#
# Options:
# -o Output directory for the zipped files. (default: present directory)
# -r Root directory of the repo, if you're not running this script from the repo
# root. (default: present directory)
set -euo pipefail

OUTPUT_DIR="$(pwd)"
REPO_ROOT="$(pwd)"

while getopts "o:r:" opt; do
  case $opt in
    o) OUTPUT_DIR="$OPTARG"
    ;;
    r) REPO_ROOT="$OPTARG"
    ;;
    *)
      >&2 echo "ERROR: option '$opt' not supported"
      exit 1
    ;;
  esac
done

cd "$REPO_ROOT" || exit 2
pnpm install
pnpm build

cd "$REPO_ROOT/apps/minifront/dist" || exit 2
# clobber timestamps for the input files to unix epoch, for reproducible zip files.
find . -type f -exec touch -t 197001010000.00 {} +
zip -r -X minifront.zip ./*
mv minifront.zip "${OUTPUT_DIR}"

cd "$REPO_ROOT/apps/node-status/dist" || exit 2
find . -type f -exec touch -t 197001010000.00 {} +
zip -r -X node-status.zip ./*
mv node-status.zip "${OUTPUT_DIR}"
