import { redirect } from 'next/navigation';
import { PagePath } from '@/shared/const/pages';

export default function RedirectPage() {
  redirect(PagePath.Trade);
}
