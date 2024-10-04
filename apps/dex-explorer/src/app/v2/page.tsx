import { redirect } from 'next/navigation';
import { PagePath } from '@/shared/pages';

export default function RedirectPage() {
  redirect(PagePath.Trade);
}
