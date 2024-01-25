import { OriginApproval } from '@penumbra-zone/types/src/internal-msg/origin-approval';
import { sendPopupRequest, spawnDetachedPopup } from '@penumbra-zone/types/src/internal-msg/popup';

export const getOriginApproval = async (site: string): Promise<boolean | undefined> => {
  await spawnDetachedPopup('popup.html#/approval/connect');

  const res = await sendPopupRequest<OriginApproval>({
    type: 'ORIGIN-APPROVAL',
    request: site,
  });
  if ('error' in res) throw res.error;
  if (!res.data) throw new Error('Origin was not approved');

  return res.data;
};
