'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon';
import { Role } from '@/lib/types';

type AppShellProps = {
  children: ReactNode;
  logoutAction: () => Promise<void>;
  role: Role;
};

type NavigationItem = {
  href: '/admin' | '/admin/history' | '/user' | '/user/history';
  icon: IconName;
  label: string;
};

const navigationByRole: Record<Role, NavigationItem[]> = {
  [Role.ADMIN]: [
    { href: '/admin', icon: 'home', label: 'Home' },
    { href: '/admin/history', icon: 'history', label: 'History' },
  ],
  [Role.USER]: [
    { href: '/user', icon: 'home', label: 'Home' },
    { href: '/user/history', icon: 'history', label: 'History' },
  ],
};

export function AppShell({ children, logoutAction, role }: AppShellProps) {
  const pathname = usePathname();
  const navigation = navigationByRole[role];
  const label = role === Role.ADMIN ? 'Admin' : 'User';

  const navigationLinks = (compact = false) => (
    <nav
      aria-label={`${label} navigation`}
      className={compact ? 'flex items-center gap-1' : 'space-y-4'}
    >
      {navigation.map(({ href, icon, label: itemLabel }) => {
        const isActive = pathname === href;

        return (
          <Link
            className={
              compact
                ? `inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-active text-ink'
                      : 'text-muted hover:bg-sidebar-active/60 hover:text-ink'
                  }`
                : `flex min-h-[68px] items-center gap-3 rounded-card px-4 text-2xl transition-colors ${
                    isActive
                      ? 'bg-sidebar-active text-ink'
                      : 'text-ink hover:bg-sidebar-active/60'
                  }`
            }
            href={href}
            key={href}
          >
            <Icon className={compact ? 'size-5' : 'size-6'} name={icon} />
            {itemLabel}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-page md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <header className="flex items-center justify-between border-b border-sidebar-border bg-surface px-4 py-3 md:hidden">
        <strong className="text-xl font-semibold">{label}</strong>
        <div className="flex items-center gap-2">
          {navigationLinks(true)}
          <form action={logoutAction}>
            <button
              aria-label="Log out"
              className="inline-flex size-10 items-center justify-center rounded-control text-muted transition-colors hover:bg-sidebar-active hover:text-ink"
              type="submit"
            >
              <Icon className="size-5" name="logout" />
            </button>
          </form>
        </div>
      </header>

      <aside className="hidden min-h-dvh flex-col border-r border-sidebar-border bg-surface px-4 py-14 md:flex">
        <strong className="px-6 text-[40px] font-semibold leading-[1.2]">
          {label}
        </strong>
        <div className="mt-12">{navigationLinks()}</div>
        <form action={logoutAction} className="mt-auto">
          <button
            className="flex min-h-[68px] w-full items-center gap-3 rounded-card px-4 text-2xl transition-colors hover:bg-sidebar-active"
            type="submit"
          >
            <Icon className="size-6" name="logout" />
            Log out
          </button>
        </form>
      </aside>

      {children}
    </div>
  );
}
