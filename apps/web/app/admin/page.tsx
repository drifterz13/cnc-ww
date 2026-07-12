import Link from 'next/link';
import { createConcertAction, deleteConcertAction } from './actions';
import { ApiClient } from '@/lib/api';
import { DeleteConcertForm } from '@/components/delete-concert-form';
import { Icon } from '@/components/icon';
import { SaveIcon } from '@/components/icons';
import { getErrorMessage } from '@/lib/errors';
import { requireRole } from '@/lib/session';
import { Role, type AuditReservation, type Concert } from '@/lib/types';

type AdminPageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await requireRole(Role.ADMIN);
  const apiClient = new ApiClient({ token: session.token });
  const notices = await searchParams;
  const view = notices.view === 'create' ? 'create' : 'overview';
  let concerts: Concert[] = [];
  let audit: AuditReservation[] = [];
  let loadError: string | undefined;

  try {
    [concerts, audit] = await Promise.all([
      apiClient.get<Concert[]>('/concerts/manage'),
      apiClient.get<AuditReservation[]>('/audit/reservations'),
    ]);
  } catch (error) {
    loadError = getErrorMessage(error);
  }

  const totalSeats = concerts.reduce(
    (total, concert) => total + concert.totalSeats,
    0,
  );
  const activeReservations = audit.filter(
    (item) => item.status === 'ACTIVE',
  ).length;
  const cancelledReservations = audit.filter(
    (item) => item.status === 'CANCELLED',
  ).length;

  return (
    <main className="min-w-0 px-4 py-8 sm:px-8 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1120px]">
        {loadError ? (
          <p
            className="mb-6 rounded-control border border-danger-confirm bg-danger-confirm/10 px-4 py-3 text-danger-confirm"
            role="alert"
          >
            {loadError}
          </p>
        ) : null}

        <section
          aria-label="Reservation summary"
          className="grid gap-6 md:grid-cols-3"
        >
          <article className="flex min-h-[235px] flex-col items-center justify-center rounded-card bg-brand px-6 py-5 text-center text-surface">
            <Icon className="size-10" name="user-light" />
            <p className="mt-3 text-2xl leading-9">Total of seats</p>
            <p className="mt-3 text-6xl font-light leading-[1.5]">
              {totalSeats}
            </p>
          </article>
          <article className="flex min-h-[235px] flex-col items-center justify-center rounded-card bg-success px-6 py-5 text-center text-surface">
            <Icon className="size-10" name="award" />
            <p className="mt-3 text-2xl leading-9">Reserve</p>
            <p className="mt-3 text-6xl font-light leading-[1.5]">
              {activeReservations}
            </p>
          </article>
          <article className="flex min-h-[235px] flex-col items-center justify-center rounded-card bg-danger-user px-6 py-5 text-center text-surface">
            <Icon className="size-10" name="cancel-light" />
            <p className="mt-3 text-2xl leading-9">Cancel</p>
            <p className="mt-3 text-6xl font-light leading-[1.5]">
              {cancelledReservations}
            </p>
          </article>
        </section>

        <nav
          aria-label="Admin home sections"
          className="mt-8 flex items-end gap-8"
        >
          <Link
            className={`border-b-2 px-4 pb-2 text-2xl leading-9 transition-colors ${
              view === 'overview'
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-muted hover:text-ink'
            }`}
            href="/admin"
          >
            Overview
          </Link>
          <Link
            className={`border-b-2 px-4 pb-2 text-2xl leading-9 transition-colors ${
              view === 'create'
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-muted hover:text-ink'
            }`}
            href="/admin?view=create"
          >
            Create
          </Link>
        </nav>

        {view === 'create' ? (
          <section className="mt-12 rounded-card border border-border-subtle bg-surface p-6 sm:p-10">
            <h1 className="border-b border-border-subtle pb-5 text-[40px] font-semibold leading-[1.2] text-primary">
              Create
            </h1>
            <form
              action={createConcertAction}
              className="mt-6 grid gap-6 md:grid-cols-2"
            >
              <div className="space-y-4">
                <label className="block text-2xl leading-9" htmlFor="name">
                  Concert Name
                </label>
                <input
                  className="h-12 w-full rounded-control border border-border bg-surface px-3 text-base outline-none placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20"
                  id="name"
                  maxLength={120}
                  name="name"
                  placeholder="Please input concert name"
                  required
                />
              </div>
              <div className="space-y-4">
                <label
                  className="block text-2xl leading-9"
                  htmlFor="totalSeats"
                >
                  Total of seat
                </label>
                <input
                  className="h-12 w-full rounded-control border border-border bg-surface px-3 text-base outline-none placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20"
                  id="totalSeats"
                  max="100000"
                  min="1"
                  name="totalSeats"
                  placeholder="500"
                  required
                  type="number"
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <label
                  className="block text-2xl leading-9"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  className="min-h-28 w-full resize-y rounded-control border border-border bg-surface px-3 py-2 text-base outline-none placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20"
                  id="description"
                  maxLength={2000}
                  name="description"
                  placeholder="Please input description"
                  required
                />
              </div>
              <div className="flex justify-end md:col-span-2">
                <button
                  className="inline-flex h-[60px] items-center gap-3 rounded-control bg-primary px-5 text-2xl font-medium text-surface transition-colors hover:bg-primary/90"
                  type="submit"
                >
                  <SaveIcon className="size-6" />
                  Save
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section
            aria-labelledby="concerts-heading"
            className="mt-5 space-y-6"
          >
            <h1 className="sr-only" id="concerts-heading">
              Concert overview
            </h1>
            {concerts.length === 0 ? (
              <p className="rounded-card border border-border-subtle bg-surface p-10 text-muted">
                No concerts found.
              </p>
            ) : null}
            {concerts.map((concert) => (
              <article
                className="rounded-card border border-border-subtle bg-surface p-6 sm:p-10"
                key={concert.id}
              >
                <h2 className="border-b border-border-subtle pb-5 text-[32px] font-semibold leading-[1.2] text-primary">
                  {concert.name}
                </h2>
                <p className="mt-6 max-w-[65ch] text-2xl leading-[1.5]">
                  {concert.description}
                </p>
                <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <p className="inline-flex items-center gap-3 text-2xl leading-9">
                    <Icon className="size-8" name="user-dark" />
                    {concert.availableSeats} of {concert.totalSeats} seats
                    available
                  </p>
                  <DeleteConcertForm
                    action={deleteConcertAction.bind(null, concert.id)}
                    concertName={concert.name}
                  />
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
