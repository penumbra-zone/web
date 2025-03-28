import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const stateToString = (state?: PositionState_PositionStateEnum) => {
  switch (state) {
    case PositionState_PositionStateEnum.UNSPECIFIED: {
      return 'Unspecified';
    }
    case PositionState_PositionStateEnum.OPENED: {
      return 'Opened';
    }
    case PositionState_PositionStateEnum.CLOSED: {
      return 'Closed';
    }
    case PositionState_PositionStateEnum.WITHDRAWN: {
      return 'Withdrawn';
    }
    case PositionState_PositionStateEnum.CLAIMED: {
      return 'Claimed';
    }
    case undefined: {
      return 'Unspecified';
    }
  }
};
