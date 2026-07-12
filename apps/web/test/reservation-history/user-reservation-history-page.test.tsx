import UserHistoryPage from '@/app/user/history/page';
import { requireRole } from '@/lib/session';
import { Role } from '@/lib/types';
import { activeReservation } from '../fixtures/concerts.fixture';
import { showReservationHistory } from '../helpers/api.handler';
import { render, screen } from '../helpers/render';
import { server } from '../msw/server';

jest.mock('@/lib/session', () => ({
  requireRole: jest.fn(),
}));

const mockedRequireRole = requireRole as jest.MockedFunction<
  typeof requireRole
>;

describe('Personal reservation history UI integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a user their reservation history', async () => {
    mockedRequireRole.mockResolvedValue({
      token: 'user-session-token',
      userId: 1,
      role: Role.USER,
    });
    server.use(showReservationHistory([activeReservation]));

    render(await UserHistoryPage());

    expect(screen.getByText('My Concert')).toBeInTheDocument();
    expect(screen.getByText('Reserved')).toBeInTheDocument();
  });
});
