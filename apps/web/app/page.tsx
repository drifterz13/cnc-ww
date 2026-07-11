import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function HomePage() {
  const session = await getSession();
  redirect(
    session?.role === Role.ADMIN
      ? '/admin'
      : session?.role === Role.USER
        ? '/user'
        : '/login',
  );
}
