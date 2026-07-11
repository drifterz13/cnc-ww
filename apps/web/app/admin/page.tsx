import { createConcertAction, deleteConcertAction } from './actions';
import { ApiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { requireRole } from '@/lib/session';
import { Role, type AuditReservation, type Concert } from '@/lib/types';

type AdminPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await requireRole(Role.ADMIN);
  const apiClient = new ApiClient({ token: session.token });
  const notices = await searchParams;
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
    <main>
      <h1>Admin</h1>
      {notices.error || loadError ? (
        <p role="alert">{notices.error ?? loadError}</p>
      ) : null}
      {notices.success ? <p role="status">{notices.success}</p> : null}

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading">Summary</h2>
        <dl className="summary">
          <div>
            <dt>Total seats</dt>
            <dd>{totalSeats}</dd>
          </div>
          <div>
            <dt>Active reservations</dt>
            <dd>{activeReservations}</dd>
          </div>
          <div>
            <dt>Cancelled reservations</dt>
            <dd>{cancelledReservations}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="create-heading">
        <h2 id="create-heading">Create concert</h2>
        <form action={createConcertAction}>
          <label htmlFor="name">Concert name</label>
          <input id="name" name="name" required maxLength={120} />

          <label htmlFor="totalSeats">Total seats</label>
          <input
            id="totalSeats"
            name="totalSeats"
            type="number"
            min="1"
            max="100000"
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            required
            maxLength={2000}
          />

          <button type="submit">Create concert</button>
        </form>
      </section>

      <section aria-labelledby="concerts-heading">
        <h2 id="concerts-heading">Concerts</h2>
        {concerts.length === 0 ? <p>No concerts found.</p> : null}
        {concerts.map((concert) => (
          <article key={concert.id}>
            <h3>{concert.name}</h3>
            <p>{concert.description}</p>
            <p>
              {concert.availableSeats} of {concert.totalSeats} seats available
            </p>
            <form action={deleteConcertAction.bind(null, concert.id)}>
              <button type="submit">Delete</button>
            </form>
          </article>
        ))}
      </section>
    </main>
  );
}
