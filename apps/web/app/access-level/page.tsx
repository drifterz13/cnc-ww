import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Icon } from '@/components/icon';
import { getSession } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function AccessLevelPage() {
  const session = await getSession();

  if (session) {
    redirect(session.role === Role.ADMIN ? '/admin' : '/user');
  }

  return (
    <main className="min-h-dvh bg-page">
      <div className="w-full bg-surface">
        <header className="flex h-28 items-center px-9">
          <div className="flex items-center gap-3 text-2xl font-semibold text-brand">
            <span className="size-6 rounded-full bg-brand" />
            BRAND
          </div>
        </header>
        <section className="border-t border-page px-6 py-16 sm:px-12 lg:px-20 lg:py-[72px]">
          <div className="mx-auto max-w-[1175px]">
            <div className="text-center">
              <h1 className="text-[40px] font-semibold leading-[1.5] sm:text-[48px]">
                Select Access Level
              </h1>
              <p className="mt-1 text-xl leading-9">
                Choose the workspace that fits your role.
              </p>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-20">
              <article className="flex min-h-[580px] flex-col rounded-role bg-surface px-10 py-24 shadow-role-card sm:px-24">
                <Icon className="size-[90px]" name="user-access" />
                <h2 className="mt-10 text-4xl font-semibold leading-[1.3] text-brand">
                  User
                </h2>
                <p className="mt-7 max-w-[360px] text-base leading-[26px] text-brand">
                  Discover available concerts, reserve a free seat, and review
                  your reservation history.
                </p>
                <Link
                  className="mt-auto inline-flex h-14 items-center justify-center gap-3 rounded-control bg-brand px-6 text-2xl font-medium text-surface transition-colors hover:bg-brand/90"
                  href="/login"
                >
                  Enter Workspace
                  <Icon className="size-6" name="arrow-light" />
                </Link>
              </article>

              <article className="flex min-h-[580px] flex-col rounded-role bg-brand px-10 py-24 text-surface sm:px-24">
                <Icon className="size-[90px]" name="manage-account" />
                <h2 className="mt-10 text-4xl font-semibold leading-[1.3]">
                  Admin
                </h2>
                <p className="mt-7 max-w-[360px] text-base leading-[26px]">
                  Manage concert listings, monitor reservations, and review the
                  complete activity history.
                </p>
                <Link
                  className="mt-auto inline-flex h-14 items-center justify-center gap-3 rounded-control bg-surface px-6 text-2xl font-medium text-brand transition-colors hover:bg-page"
                  href="/login/admin"
                >
                  Enter Portal
                  <Icon className="size-6" name="arrow-brand" />
                </Link>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
