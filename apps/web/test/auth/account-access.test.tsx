import { LoginForm } from '@/app/login/login-form';
import { SignupForm } from '@/app/signup/signup-form';
import { PasswordInput } from '@/components/password-input';
import { setSession } from '@/lib/session';
import { Role } from '@/lib/types';
import {
  acceptSignIn,
  acceptSignup,
  delaySignInRejection,
  rejectSignIn,
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
  setSession: jest.fn(),
}));

const mockedSetSession = setSession as jest.MockedFunction<typeof setSession>;

describe('Account access UI integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('shows the sign-in fields for an existing account', () => {
    render(<LoginForm />, { notice: false });

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Login as User' }),
    ).toBeInTheDocument();
  });

  it('shows the account creation fields for a new user', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create an account' }),
    ).toBeInTheDocument();
  });

  it('shows an account creation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText('Full name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.type(screen.getByLabelText('Confirm Password'), 'Different123!');
    await user.click(screen.getByRole('button', { name: 'Create an account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Passwords do not match.',
    );
  });

  it('shows that sign-in is in progress while credentials are checked', async () => {
    const user = userEvent.setup();
    server.use(delaySignInRejection());
    render(<LoginForm />, { notice: false });

    await user.type(screen.getByLabelText('Email'), 'user1@concert-wow.test');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Login as User' }));

    expect(
      await screen.findByRole('button', { name: 'Signing in...' }),
    ).toBeDisabled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password',
    );
  });

  it('shows a sign-in error when credentials are invalid', async () => {
    const user = userEvent.setup();
    server.use(rejectSignIn());
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'invalid@concert-wow.test');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Login as User' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password',
    );
  });

  it('sends an admin to the admin home after successful sign-in', async () => {
    const user = userEvent.setup();
    mockedSetSession.mockResolvedValue({
      token: 'admin-session-token',
      userId: 1,
      role: Role.ADMIN,
    });
    server.use(acceptSignIn('admin-session-token'));
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@concert-wow.test');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Login as User' }));

    await waitFor(() => assertCurrentRoute('/admin'));
  });

  it('sends a user to concert discovery after successful sign-in', async () => {
    const user = userEvent.setup();
    mockedSetSession.mockResolvedValue({
      token: 'user-session-token',
      userId: 1,
      role: Role.USER,
    });
    server.use(acceptSignIn('user-session-token'));
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'user1@concert-wow.test');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Login as User' }));

    await waitFor(() => assertCurrentRoute('/user'));
  });

  it('shows a success message after a user creates an account', async () => {
    const user = userEvent.setup();
    mockedSetSession.mockResolvedValue({
      token: 'user-session-token',
      userId: 1,
      role: Role.USER,
    });
    server.use(acceptSignup('user-session-token'));
    render(<SignupForm />, { notice: false });

    await user.type(screen.getByLabelText('Full name'), 'New User');
    await user.type(screen.getByLabelText('Email'), 'new-user@concert-wow.test');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Create an account' }));

    await waitFor(() =>
      assertCurrentRoute('/user', { success: 'Account created.' }),
    );
    render(null);

    expect(await screen.findByText('Account created.')).toBeVisible();
  });

  it('lets a user show and hide their password', async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        autoComplete="current-password"
        id="password"
        placeholder="Enter your Password"
      />,
    );

    const password = screen.getByPlaceholderText('Enter your Password');
    expect(password).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password).toHaveAttribute('type', 'password');
  });
});
