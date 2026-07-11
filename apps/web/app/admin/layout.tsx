import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '@/app/auth/actions';
import { requireRole } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireRole(Role.ADMIN);

  return (
    <>
      <header>
        <strong>Concert Wow Admin</strong>
        <nav aria-label="Admin navigation">
          <Link href="/admin">Home</Link>
          <Link href="/admin/history">History</Link>
          <form action={logoutAction}>
            <button type="submit">Log out</button>
          </form>
        </nav>
      </header>
      {children}
    </>
  );
}
