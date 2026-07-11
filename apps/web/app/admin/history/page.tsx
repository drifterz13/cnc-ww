import { ApiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { requireRole } from '@/lib/session';
import { Role, type AuditReservation } from '@/lib/types';

export default async function AdminHistoryPage() {
  const session = await requireRole(Role.ADMIN);
  const apiClient = new ApiClient({ token: session.token });
  let history: AuditReservation[] = [];
  let loadError: string | undefined;

  try {
    history = await apiClient.get('/audit/reservations');
  } catch (error) {
    loadError = getErrorMessage(error);
  }

  return (
    <main>
      <h1>Reservation history</h1>
      {loadError ? <p role="alert">{loadError}</p> : null}
      {history.length === 0 ? (
        <p>No reservation history found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Concert</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.cancelledAt ?? item.reservedAt)}</td>
                <td>{item.user.email}</td>
                <td>{item.concert.name}</td>
                <td>{item.status === 'ACTIVE' ? 'Reserved' : 'Cancelled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
