import { redirect } from 'next/navigation';
import { PagePath } from '@/utils/routes/pages.ts';

export default function RedirectPage() {
  redirect(PagePath.Trade);
}
