#!/usr/bin/env bash

# Creates wallets and validators for testing with.
#
# Usage:
# sh scripts/create-validators -n 100 -b /tmp/pcli-validators
#
# Options:
# -n Number of wallets/validators to create. (default: 2)
# -b The base directory to put the wallets/validators in. Subdirectories named
#    `validator-N` will be created in this directory, containing config for pcli
#    and the validator. If a subdirectory by that name already exists, it will
#    skip that name. (default: /tmp/pcli-validators)
# -D Delete all subdirectories of the base directory specified in `-b`.
#    DANGEROUS!  Only use this if you are sure that all subdirectories can be
#    deleted.

NUMBER=2
BASE_DIRECTORY="/tmp/pcli-validators"

while getopts "n:b:D" opt; do
  case $opt in
    n) NUMBER="$OPTARG"
    ;;
    b) BASE_DIRECTORY="$OPTARG"
    ;;
    D)
      echo "-D flag not yet implemented"
      exit -1
    ;;
  esac
done


for ((i=1; i <= NUMBER; i++)); do
  DIRECTORY="$BASE_DIRECTORY/validator-$i"

  if test -d $DIRECTORY; then
    echo "$DIRECTORY already exists. Skipping."
  else
    mkdir -p $DIRECTORY

    # Initialize a wallet and validator template
    pcli --home $DIRECTORY init --grpc-url http://localhost:8080 soft-kms generate
    pcli --home $DIRECTORY validator definition template --file $DIRECTORY/validator.toml

    # Enable the validator, and give it a name/description/website
    sed -i '' \
      -e 's/enabled = false/enabled = true/' \
      -e "s/name = \"\"/name = \"Test validator $i\"/" \
      -e "s/description = \"\"/description = \"Description for test validator $i\"/" \
      -e "s/website = \"\"/website = \"https:\/\/test-validator-$i.example.com\"/" \
      $DIRECTORY/validator.toml

    # Upload the validator definition
    pcli --home $DIRECTORY validator definition upload --file $DIRECTORY/validator.toml &
  fi
done
