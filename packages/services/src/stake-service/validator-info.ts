import { Impl } from '.';
import { servicesCtx } from '../ctx/prax';
import {
  CurrentValidatorRateRequest,
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { getStateEnumFromValidatorInfo } from '@penumbra-zone/getters/validator-info';

export const validatorInfo: Impl['validatorInfo'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();

  let validatorsWithCorrectRates = 0;
  let validatorsWithInvalidRates = 0;

  for await (const validatorInfo of indexedDb.iterateValidatorInfos()) {
    if (
      !req.showInactive &&
      getStateEnumFromValidatorInfo(validatorInfo) === ValidatorState_ValidatorStateEnum.INACTIVE
    )
      continue;

    let currentValidatorRateResponse = await querier.stake.currentValidatorRate(
        new CurrentValidatorRateRequest({
          identityKey: validatorInfo.rateData?.identityKey,
        }),
    );

    if (
        !currentValidatorRateResponse?.data?.validatorExchangeRate?.equals(
            validatorInfo.rateData?.validatorExchangeRate,
        )
    ) {
      console.log('Rate data from indexed-db is not equal with rate data from currentValidatorRate RPC');
      console.log(validatorInfo.rateData, "!=", currentValidatorRateResponse.data);
      console.log("validator info: ", validatorInfo.status?.state?.state);
      console.log("-|-|-|-|-|-|-|-|-|-|-|-|-|--|-|-|-|-|-|-|-|-|-|-|-|-|-");

      validatorsWithInvalidRates++;
    } else  {
      validatorsWithCorrectRates++
    }

    console.log('validatorsWithCorrectRates ', validatorsWithCorrectRates);
    console.log('validatorsWithInvalidRates ', validatorsWithInvalidRates)


    yield new ValidatorInfoResponse({ validatorInfo });
  }
};
