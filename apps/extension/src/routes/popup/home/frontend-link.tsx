import { useStore } from '../../../state';
import { getDefaultFrontend } from '../../../state/default-frontend';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { MouseEventHandler } from 'react';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';

export const FrontendLink = () => {
  const frontendUrl = useStore(getDefaultFrontend);
  const navigate = usePopupNav();

  const onClick: MouseEventHandler = event => {
    if (frontendUrl) return;
    event.stopPropagation();
    navigate(PopupPath.SETTINGS_DEFAULT_FRONTEND);
  };

  return (
    <a href={frontendUrl} target='_blank' rel='noreferrer'>
      <Button className='flex w-full items-center gap-2' variant='gradient' onClick={onClick}>
        Manage portfolio {frontendUrl && <ExternalLink size={16} />}
      </Button>
    </a>
  );
};
