import { redirect } from 'next/navigation';
import { DappPath } from '../shared/header/types';

export default function Page() {
  redirect(DappPath.DASHBOARD);
}
