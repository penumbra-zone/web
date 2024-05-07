import {createGetter} from "./utils/create-getter";
import {
    GetValidatorInfoResponse
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb";


export const getValidatorInfo = createGetter(
    (validatorInfoResponse?: GetValidatorInfoResponse) => validatorInfoResponse?.validatorInfo,
);
