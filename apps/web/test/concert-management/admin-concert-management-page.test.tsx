import { http, HttpResponse } from 'msw';
import AdminPage from '@/app/admin/page';
import { DeleteConcertForm } from '@/components/delete-concert-form';
import { requireRole } from '@/lib/session';
import { Role } from '@/lib/types';
import { availableConcert } from '../fixtures/concerts.fixture';
import {
  showManagedConcerts,
  showReservationAudit,
} from '../helpers/api.handler';
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

describe('Admin concert management UI integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a new concert and success message after an admin creates it', async () => {
    const user = userEvent.setup();
    mockedRequireRole.mockResolvedValue({
      token: 'admin-session-token',
      userId: 1,
      role: Role.ADMIN,
    });
    const concerts = [availableConcert];
    const newConcert = {
      ...availableConcert,
      id: 3,
      name: 'Summer Festival',
      description: 'A new outdoor concert',
      totalSeats: 250,
      availableSeats: 250,
    };
    server.use(
      showManagedConcerts(concerts),
      showReservationAudit([]),
      http.post('http://localhost:3000/concerts', () => {
        concerts.push(newConcert);

        return HttpResponse.json(newConcert, { status: 201 });
      }),
    );

    const view = render(
      await AdminPage({ searchParams: Promise.resolve({ view: 'create' }) }),
      { notice: false },
    );

    await user.type(screen.getByLabelText('Concert Name'), newConcert.name);
    await user.type(screen.getByLabelText('Total of seat'), '250');
    await user.type(screen.getByLabelText('Description'), newConcert.description);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      assertCurrentRoute('/admin', { success: 'Concert created.' }),
    );
    view.unmount();

    const page = await AdminPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(
      screen.getByRole('heading', { name: 'Summer Festival' }),
    ).toBeInTheDocument();
    expect(screen.getByText('A new outdoor concert')).toBeInTheDocument();
    expect(screen.getByText('250 of 250 seats available')).toBeInTheDocument();
    expect(await screen.findByText('Concert created.')).toBeVisible();
  });

  it('removes a concert after an admin confirms deletion', async () => {
    const user = userEvent.setup();
    mockedRequireRole.mockResolvedValue({
      token: 'admin-session-token',
      userId: 1,
      role: Role.ADMIN,
    });
    const remainingConcert = {
      ...availableConcert,
      id: 2,
      name: 'Evening Concert',
    };
    const concerts = [availableConcert, remainingConcert];
    server.use(
      showManagedConcerts(concerts),
      showReservationAudit([]),
      http.delete('http://localhost:3000/concerts/:concertId', ({ params }) => {
        const concertIndex = concerts.findIndex(
          (concert) => concert.id === Number(params.concertId),
        );
        if (concertIndex >= 0) {
          concerts.splice(concertIndex, 1);
        }

        return new HttpResponse(null, { status: 204 });
      }),
    );
    const view = render(await AdminPage({ searchParams: Promise.resolve({}) }), {
      notice: false,
    });

    await user.click(screen.getAllByRole('button', { name: 'Delete' }).at(0)!);
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    await waitFor(() =>
      assertCurrentRoute('/admin', { success: 'Concert deleted.' }),
    );
    view.unmount();

    render(await AdminPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.queryByRole('heading', { name: 'My Concert' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Evening Concert' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Concert deleted.')).toBeVisible();
  });

  it('keeps a concert when reservation history prevents deletion', async () => {
    const user = userEvent.setup();
    mockedRequireRole.mockResolvedValue({
      token: 'admin-session-token',
      userId: 1,
      role: Role.ADMIN,
    });
    server.use(
      showManagedConcerts([availableConcert]),
      showReservationAudit([]),
      http.delete('http://localhost:3000/concerts/:concertId', () =>
        HttpResponse.json(
          {
            message:
              'A concert cannot be deleted while it has reservation history',
          },
          { status: 409 },
        ),
      ),
    );
    const view = render(await AdminPage({ searchParams: Promise.resolve({}) }), {
      notice: false,
    });

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    await waitFor(() =>
      assertCurrentRoute('/admin', {
        error: 'A concert cannot be deleted while it has reservation history',
      }),
    );
    view.unmount();

    render(await AdminPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole('heading', { name: 'My Concert' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        'A concert cannot be deleted while it has reservation history',
      ),
    ).toBeVisible();
  });

  it('asks an admin to confirm concert deletion', async () => {
    const user = userEvent.setup();
    const action = jest.fn();
    render(<DeleteConcertForm action={action} concertName="My Concert" />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('“My Concert”')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Yes, delete' }),
    ).toBeInTheDocument();
  });
});
