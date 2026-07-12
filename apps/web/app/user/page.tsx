import { cancelAction, reserveAction } from './actions';
import { ApiClient } from '@/lib/api';
import { Icon } from '@/components/icon';
import { getErrorMessage } from '@/lib/errors';
import { requireRole } from '@/lib/session';
import { Role, type Concert, type ReservationHistory } from '@/lib/types';

export default async function UserPage() {
  const session = await requireRole(Role.USER);
  const apiClient = new ApiClient({ token: session.token });
  let concerts: Concert[] = [];
  let history: ReservationHistory[] = [];
  let loadError: string | undefined;

  try {
    [concerts, history] = await Promise.all([
      apiClient.get<Concert[]>('/concerts'),
      apiClient.get<ReservationHistory[]>('/history/reservations'),
    ]);
  } catch (error) {
    loadError = getErrorMessage(error);
  }

  const reservationByConcert = new Map(
    history.map((item) => [item.concert.id, item]),
  );

  return (
    <main className="min-w-0 px-4 py-8 sm:px-8 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1120px] space-y-6">
        <h1 className="sr-only">Available concerts</h1>
        {loadError ? (
          <p
            className="rounded-control border border-danger-confirm bg-danger-confirm/10 px-4 py-3 text-danger-confirm"
            role="alert"
          >
            {loadError}
          </p>
        ) : null}
        {concerts.length === 0 ? (
          <p className="rounded-card border border-border-subtle bg-surface p-10 text-muted">
            No concerts found.
          </p>
        ) : null}
        {concerts.map((concert) => {
          const reservation = reservationByConcert.get(concert.id);
          const hasReservation = reservation?.status === 'ACTIVE';
          const isSoldOut = concert.availableSeats === 0;

          return (
            <article
              className="rounded-card border border-border-subtle bg-surface p-6 sm:p-10"
              key={concert.id}
            >
              <h2 className="border-b border-border-subtle pb-5 text-[32px] font-semibold leading-[1.2] text-primary sm:text-[40px]">
                {concert.name}
              </h2>
              <p className="mt-6 max-w-[65ch] text-xl leading-[1.5] sm:text-2xl">
                {concert.description}
              </p>
              <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <p className="inline-flex items-center gap-3 text-2xl leading-9">
                  <Icon className="size-8" name="user-dark" />
                  {concert.availableSeats} seats available
                </p>
                {hasReservation ? (
                  <form action={cancelAction.bind(null, concert.id)}>
                    <button
                      className="h-[60px] rounded-control bg-danger-user px-8 text-2xl font-medium text-surface transition-colors hover:bg-danger-user/90"
                      type="submit"
                    >
                      Cancel
                    </button>
                  </form>
                ) : reservation ? (
                  <p className="rounded-control bg-sidebar-active px-4 py-3 text-lg text-muted">
                    Reservation cancelled
                  </p>
                ) : (
                  <form action={reserveAction.bind(null, concert.id)}>
                    <button
                      className="h-[60px] rounded-control bg-primary px-8 text-2xl font-medium text-surface transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-placeholder"
                      disabled={isSoldOut}
                      type="submit"
                    >
                      {isSoldOut ? 'Sold out' : 'Reserve'}
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
