#!/usr/bin/env bash

# Delegates to test validators created via ./create-validators.sh.
#
# Usage:
# sh scripts/delegate-to-validators -d 100 -b /tmp/pcli-validators
#
# Options:
# -n Number of validators to delegate to. (default: 2)
# -b The base directory that the validators were generated in. (default:
#    /tmp/pcli-validators)
# -d Amount (in penumbra) to delegate to each validator *from your default pcli
#    wallet*. If left empty, no delegations will be created.
# -s Start index of validators to delegate to. Only validators at this index and
#    higher will receive a delegation, until the number of validators
#    represented by the `-n` option is reached. (default: 1)
# -e End index of validators to delegate to. Validators starting at the start
#    index and up to the end index will receive a delegation, until the number
#    of validators represented by the `-n` option is reached. (Note: this means
#    that you may not actually reach the end index, if the distance between the
#    start and end indexes is greater than the value of the -n flag.) (default:
#    value of -n flag)

NUMBER=2
BASE_DIRECTORY="/tmp/pcli-validators"
DELEGATION_AMOUNT="test"
START_INDEX=1

while getopts "n:b:d:s:e:" opt; do
  case $opt in
    n) NUMBER=$OPTARG
    ;;
    b) BASE_DIRECTORY="$OPTARG"
    ;;
    d) DELEGATION_AMOUNT="$OPTARG"
    ;;
    s) START_INDEX="$OPTARG"
    ;;
    e) END_INDEX="$OPTARG"
    ;;
  esac
done

if [ -z "$DELEGATION_AMOUNT" ]; then
  echo "Please provide a delegation amount via the -d flag."
  exit -1
fi

if [ -z "$END_INDEX" ]; then
  END_INDEX=$(($START_INDEX + $NUMBER - 1))
fi

for ((i=$START_INDEX; i<=$END_INDEX; i++)); do
  if  [ $(($i - $START_INDEX)) -gt $NUMBER ]; then continue; fi
  echo $i;

  DIRECTORY="$BASE_DIRECTORY/validator-$i"

  VALIDATOR_IDENTITY_KEY=$(sed -n -E 's/(.*^identity_key = "([^"]+)"$.*)/\2/p' $DIRECTORY/validator.toml)
  echo "Running pcli tx delegate --to $VALIDATOR_IDENTITY_KEY $DELEGATION_AMOUNT""penumbra"
  pcli tx delegate --to $VALIDATOR_IDENTITY_KEY $DELEGATION_AMOUNT"penumbra"
done
