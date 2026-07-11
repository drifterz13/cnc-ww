import { ApiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { requireRole } from '@/lib/session';
import { Role, type ReservationHistory } from '@/lib/types';

export default async function UserHistoryPage() {
  const session = await requireRole(Role.USER);
  const apiClient = new ApiClient({ token: session.token });
  let history: ReservationHistory[] = [];
  let loadError: string | undefined;

  try {
    history = await apiClient.get('/history/reservations');
  } catch (error) {
    loadError = getErrorMessage(error);
  }

  return (
    <main>
      <h1>My reservation history</h1>
      {loadError ? <p role="alert">{loadError}</p> : null}
      {history.length === 0 ? (
        <p>No reservation history found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Concert</th>
              <th>Reserved</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{item.concert.name}</td>
                <td>{formatDate(item.reservedAt)}</td>
                <td>{item.status === 'ACTIVE' ? 'Active' : 'Cancelled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
