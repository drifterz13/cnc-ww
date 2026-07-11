import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '@/app/auth/actions';
import { requireRole } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function UserLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireRole(Role.USER);

  return (
    <>
      <header>
        <strong>Concert Wow</strong>
        <nav aria-label="User navigation">
          <Link href="/user">Concerts</Link>
          <Link href="/user/history">History</Link>
          <form action={logoutAction}>
            <button type="submit">Log out</button>
          </form>
        </nav>
      </header>
      {children}
    </>
  );
}
