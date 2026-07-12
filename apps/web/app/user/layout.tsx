import type { ReactNode } from 'react';
import { logoutAction } from '@/app/auth/actions';
import { AppShell } from '@/components/app-shell';
import { requireRole } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function UserLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireRole(Role.USER);

  return (
    <AppShell logoutAction={logoutAction} role={Role.USER}>
      {children}
    </AppShell>
  );
}
