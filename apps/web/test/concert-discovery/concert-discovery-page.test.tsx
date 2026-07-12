import { http, HttpResponse } from 'msw';
import UserPage from '@/app/user/page';
import { requireRole } from '@/lib/session';
import { Role, type ReservationHistory } from '@/lib/types';
import {
  activeReservation,
  availableConcert,
  soldOutConcert,
} from '../fixtures/concerts.fixture';
import { showConcerts, showReservationHistory } from '../helpers/api.handler';
import {
  assertCurrentRoute,
  render,
  screen,
  userEvent,
  waitFor,
} from '../helpers/render';
import { server } from '../msw/server';

jest.mock('@/lib/session', () => ({
  requireRole: jest.fn(),
}));

const mockedRequireRole = requireRole as jest.MockedFunction<
  typeof requireRole
>;

describe('Concert discovery UI integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows available and sold-out concerts with the current reservation state', async () => {
    mockedRequireRole.mockResolvedValue({
      token: 'user-session-token',
      userId: 1,
      role: Role.USER,
    });
    server.use(
      showConcerts([availableConcert, soldOutConcert]),
      showReservationHistory([activeReservation]),
    );

    render(await UserPage());

    expect(
      screen.getByRole('heading', { name: 'My Concert' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Sold Out Concert' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled();
  });

  it('shows a cancellation option after a user reserves a seat', async () => {
    const user = userEvent.setup();
    mockedRequireRole.mockResolvedValue({
      token: 'user-session-token',
      userId: 1,
      role: Role.USER,
    });
    const concert = { ...availableConcert, availableSeats: 1 };
    const history: typeof activeReservation[] = [];
    server.use(
      showConcerts([concert]),
      showReservationHistory(history),
      http.post(
        'http://localhost:3000/concerts/:concertId/reservations',
        () => {
          concert.availableSeats -= 1;
          history.push(activeReservation);

          return HttpResponse.json(activeReservation, { status: 201 });
        },
      ),
    );

    const view = render(await UserPage(), { notice: false });

    await user.click(screen.getByRole('button', { name: 'Reserve' }));
    await waitFor(() =>
      assertCurrentRoute('/user', { success: 'Reservation created.' }),
    );
    view.unmount();

    const page = await UserPage();
    render(page);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(await screen.findByText('Reservation created.')).toBeVisible();
  });

  it('shows a cancelled reservation after a user cancels their seat', async () => {
    const user = userEvent.setup();
    mockedRequireRole.mockResolvedValue({
      token: 'user-session-token',
      userId: 1,
      role: Role.USER,
    });
    const concert = { ...availableConcert, availableSeats: 0 };
    const reservation: ReservationHistory = { ...activeReservation };
    const history: ReservationHistory[] = [reservation];
    server.use(
      showConcerts([concert]),
      showReservationHistory(history),
      http.delete(
        'http://localhost:3000/concerts/:concertId/reservations',
        () => {
          concert.availableSeats += 1;
          reservation.status = 'CANCELLED';
          reservation.cancelledAt = '2026-07-12T02:00:00.000Z';

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const view = render(await UserPage(), { notice: false });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      assertCurrentRoute('/user', { success: 'Reservation cancelled.' }),
    );
    view.unmount();

    const page = await UserPage();
    render(page);

    expect(screen.getByText('Reservation cancelled')).toBeInTheDocument();
    expect(await screen.findByText('Reservation cancelled.')).toBeVisible();
  });

  it('shows a sold-out error when no seats remain', async () => {
    const user = userEvent.setup();
    mockedRequireRole.mockResolvedValue({
      token: 'user-session-token',
      userId: 1,
      role: Role.USER,
    });
    server.use(
      showConcerts([availableConcert]),
      showReservationHistory([]),
      http.post(
        'http://localhost:3000/concerts/:concertId/reservations',
        () =>
          HttpResponse.json(
            { message: 'This concert is sold out.' },
            { status: 409 },
          ),
      ),
    );

    const view = render(await UserPage(), { notice: false });

    await user.click(screen.getByRole('button', { name: 'Reserve' }));
    await waitFor(() =>
      assertCurrentRoute('/user', { error: 'This concert is sold out.' }),
    );
    view.unmount();

    render(null);

    expect(await screen.findByText('This concert is sold out.')).toBeVisible();
  });
});
