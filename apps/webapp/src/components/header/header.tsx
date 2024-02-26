import { LayoutLoaderResult } from '../layout';
import { Link, useLoaderData } from 'react-router-dom';
import { MessageWarningIcon } from '../../icons/message-warning';
import { MobileNavMenu } from './mobile-nav-menu';
import { Navbar } from './navbar';
import {
  NetworksPopover,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@penumbra-zone/ui';
import Notifications from './notifications';
import { PagePath } from '../metadata/paths';
import { TabletNavMenu } from './tablet-nav-menu';

// Infinite-expiry invite link to the #web-ext-feedback channel. Provided by
// Henry (@hdevalence) and thus tied to his Discord account, so reach out to him
// if there are any problems with this link.
const WEB_EXT_FEEDBACK_DISCORD_CHANNEL = 'https://discord.gg/XDNcrhKVwV';

export const Header = () => {
  const result = useLoaderData() as LayoutLoaderResult;

  return (
    <header className='z-10 flex w-full flex-col items-center justify-between px-6 md:h-[82px] md:flex-row md:gap-12 md:px-12'>
      <div className='mb-[30px] md:mb-0'>
        <img
          src='./penumbra-logo.svg'
          alt='Penumbra logo'
          className='absolute inset-x-0 top-[-75px] mx-auto h-[141px] w-[136px] rotate-[320deg] md:left-[-100px] md:top-[-140px] md:mx-0 md:size-[234px]'
        />
        <Link to={PagePath.INDEX}>
          <img
            src='./logo.svg'
            alt='Penumbra logo'
            className='relative z-10 mt-[20px] h-4 w-[171px] md:mt-0'
          />
        </Link>
      </div>
      <Navbar />
      <div className='flex w-full items-center justify-between gap-4 md:w-auto md:gap-6 xl:gap-4'>
        <div className='order-1 block md:hidden'>
          <MobileNavMenu />
        </div>
        <TabletNavMenu />

        <div className='order-3 flex items-center justify-center md:order-none'>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <a
                  href={WEB_EXT_FEEDBACK_DISCORD_CHANNEL}
                  target='_blank'
                  rel='noreferrer'
                  aria-label='Send feedback via our Discord channel'
                >
                  <MessageWarningIcon />
                </a>
              </TooltipTrigger>
              <TooltipContent>Send feedback via our Discord channel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {result.isInstalled ? (
          <>
            <div className='order-3 flex items-center justify-center md:order-none'>
              <Notifications />
            </div>
            <div className='order-2 flex grow justify-center md:order-none'>
              <NetworksPopover name={result.chainId} />
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
};
