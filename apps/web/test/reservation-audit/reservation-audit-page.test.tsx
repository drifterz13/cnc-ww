import AdminHistoryPage from '@/app/admin/history/page';
import { requireRole } from '@/lib/session';
import { Role } from '@/lib/types';
import {
  auditReservation,
  cancelledAuditReservation,
} from '../fixtures/concerts.fixture';
import { showReservationAudit } from '../helpers/api.handler';
import { render, screen } from '../helpers/render';
import { server } from '../msw/server';

jest.mock('@/lib/session', () => ({
  requireRole: jest.fn(),
}));

const mockedRequireRole = requireRole as jest.MockedFunction<
  typeof requireRole
>;

describe('Reservation audit UI integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows every user's reservation history to an admin", async () => {
    mockedRequireRole.mockResolvedValue({
      token: 'admin-session-token',
      userId: 1,
      role: Role.ADMIN,
    });
    server.use(
      showReservationAudit([auditReservation, cancelledAuditReservation]),
    );

    render(await AdminHistoryPage());

    expect(screen.getByText('user1@concert-wow.test')).toBeInTheDocument();
    expect(screen.getByText('user2@concert-wow.test')).toBeInTheDocument();
    expect(screen.getByText('Reserve')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
