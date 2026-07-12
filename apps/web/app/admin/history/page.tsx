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
    <main className="min-w-0 px-4 py-8 sm:px-8 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1180px]">
        <h1 className="sr-only">Reservation history</h1>
        {loadError ? (
          <p
            className="mb-6 rounded-control border border-danger-confirm bg-danger-confirm/10 px-4 py-3 text-danger-confirm"
            role="alert"
          >
            {loadError}
          </p>
        ) : null}
        {history.length === 0 ? (
          <p className="rounded-card border border-border-subtle bg-surface p-10 text-muted">
            No reservation history found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-control border border-border">
            <table className="min-w-[720px] w-full border-collapse font-table text-left">
              <thead className="text-xl font-semibold leading-[1.5]">
                <tr>
                  <th className="border-b border-r border-border px-3 py-3 last:border-r-0">
                    Date time
                  </th>
                  <th className="border-b border-r border-border px-3 py-3 last:border-r-0">
                    Username
                  </th>
                  <th className="border-b border-r border-border px-3 py-3 last:border-r-0">
                    Concert name
                  </th>
                  <th className="border-b border-border px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="text-base leading-6">
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="border-r border-border px-3 py-3">
                      {formatDate(item.cancelledAt ?? item.reservedAt)}
                    </td>
                    <td className="border-r border-border px-3 py-3">
                      {item.user.email}
                    </td>
                    <td className="border-r border-border px-3 py-3">
                      {item.concert.name}
                    </td>
                    <td className="px-3 py-3">
                      {item.status === 'ACTIVE' ? 'Reserve' : 'Cancel'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
