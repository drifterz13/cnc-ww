import { cancelAction, reserveAction } from './actions';
import { ApiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { requireRole } from '@/lib/session';
import { Role, type Concert, type ReservationHistory } from '@/lib/types';

type UserPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function UserPage({ searchParams }: UserPageProps) {
  const session = await requireRole(Role.USER);
  const apiClient = new ApiClient({ token: session.token });
  const notices = await searchParams;
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
    <main>
      <h1>Concerts</h1>
      {notices.error || loadError ? (
        <p role="alert">{notices.error ?? loadError}</p>
      ) : null}
      {notices.success ? <p role="status">{notices.success}</p> : null}
      {concerts.length === 0 ? <p>No concerts found.</p> : null}
      {concerts.map((concert) => {
        const reservation = reservationByConcert.get(concert.id);

        return (
          <article key={concert.id}>
            <h2>{concert.name}</h2>
            <p>{concert.description}</p>
            <p>
              {concert.availableSeats} of {concert.totalSeats} seats available
            </p>
            {reservation?.status === 'ACTIVE' ? (
              <form action={cancelAction.bind(null, concert.id)}>
                <button type="submit">Cancel reservation</button>
              </form>
            ) : reservation ? (
              <p>Reservation cancelled</p>
            ) : (
              <form action={reserveAction.bind(null, concert.id)}>
                <button type="submit" disabled={concert.availableSeats === 0}>
                  Reserve
                </button>
              </form>
            )}
          </article>
        );
      })}
    </main>
  );
}
