#!/bin/sh

# pnpm doesn't like to recurse for the pack command, and turbo doesn't
# understand it as a script.  this script should pack every non-private package.

pnpm turbo run build --filter="./packages/*"

for packageJ in packages/*/package.json; do
    package=$(dirname $packageJ)
    private=$(pnpm pkg get private -C "$package")
    if [ "$private" != "true" ]; then
        pnpm pack -C "$package" &
    fi
done

wait
