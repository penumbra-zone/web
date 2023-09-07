import {
  GlobeIcon,
  LockClosedIcon,
  MixerHorizontalIcon,
  PersonIcon,
  TextAlignLeftIcon,
} from '@radix-ui/react-icons';
import { PopupPath } from '../paths';
import { FadeTransition } from '../../../components';
import { BackIcon, Button } from 'ui/components';
import { usePopupNav } from '../../../utils/navigate';

const links = [
  {
    title: 'Advanced',
    icon: <MixerHorizontalIcon className='h-5 w-5 text-foreground' />,
    href: PopupPath.SETTINGS_ADVANCED,
  },
  {
    title: 'Contact Information',
    icon: <PersonIcon className='h-5 w-5 text-foreground' />,
    href: PopupPath.SETTINGS_CONTACTS,
  },
  {
    title: 'Security & Privacy',
    icon: <LockClosedIcon className='h-5 w-5 text-foreground' />,
    href: PopupPath.SETTINGS_SECURITY,
  },
  {
    title: 'Networks',
    icon: <GlobeIcon className='h-5 w-5 text-foreground' />,
    href: PopupPath.SETTINGS_NETWORKS,
  },
  {
    title: 'Permission',
    icon: <TextAlignLeftIcon className='h-5 w-5 text-foreground' />,
    href: PopupPath.SETTINGS_PERMISSION,
  },
];

export const Settings = () => {
  const navigate = usePopupNav();
  return (
    <FadeTransition className='flex flex-col items-stretch justify-start'>
      <BackIcon className='absolute top-6 text-foreground' onClick={() => navigate(-1)} />
      <h1 className='border-b border-[rgba(75,75,75,0.50)] pb-2 pt-5 text-center'>Settings</h1>
      <div className='flex flex-1 flex-col items-start gap-4 p-4'>
        {links.map(i => (
          <Button
            key={i.href}
            variant='ghost'
            className='flex w-full items-center justify-start gap-2 p-[10px] text-left hover:bg-transparent hover:opacity-50'
            onClick={() => navigate(i.href)}
          >
            {i.icon}
            <p className='text-foreground'>{i.title}</p>
          </Button>
        ))}
      </div>
    </FadeTransition>
  );
};
