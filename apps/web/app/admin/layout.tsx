import type { ReactNode } from 'react';
import { logoutAction } from '@/app/auth/actions';
import { AppShell } from '@/components/app-shell';
import { requireRole } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireRole(Role.ADMIN);

  return (
    <AppShell logoutAction={logoutAction} role={Role.ADMIN}>
      {children}
    </AppShell>
  );
}
