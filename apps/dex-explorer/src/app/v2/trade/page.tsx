'use client';

import { redirect } from 'next/navigation';

// TODO: Should dynamically pull from assets to display a priority pair
//       and/or can store last selected pair in local storage so it feels like
//       users are returning to the screen they were looking at previously
export default function TradeBasePath() {
  redirect(`/v2/trade/UM/USDC`);
}
