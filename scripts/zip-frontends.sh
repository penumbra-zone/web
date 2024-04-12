#!/usr/bin/env bash

# Runs `pnpm build`, then zips the `dist` directories for both minifront and
# node-status so that they can be PRed to the core repo.
#
# Usage:
# sh ./scripts/zip-frontends -o /tmp
#
# Options:
# -o Output directory for the zipped files. (default: present directory)
# -r Root directory of the repo, if you're not running this script from the repo
# root. (default: present directory)

OUTPUT_DIR=$(pwd)
REPO_ROOT=$(pwd)

while getopts "o:r:" opt; do
  case $opt in
    o) OUTPUT_DIR="$OPTARG"
    ;;
    r) REPO_ROOT="$OPTARG"
    ;;
  esac
done

cd $REPO_ROOT
pnpm build

cd $REPO_ROOT/apps/minifront/dist
zip -r minifront.zip *
mv minifront.zip ${OUTPUT_DIR}

cd $REPO_ROOT/apps/node-status/dist
zip -r node-status.zip *
mv node-status.zip ${OUTPUT_DIR}
