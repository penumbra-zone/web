import { redirect } from 'next/navigation';
import { DappPath } from './header/paths';

export default function Page() {
  redirect(DappPath.DASHBOARD);
}
