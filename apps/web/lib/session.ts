import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Role } from './types';

const COOKIE_NAME = 'concert_wow_session';
const ONE_HOUR = 60 * 60;

type Session = {
  token: string;
  userId: number;
  role: Role;
};

type JwtPayload = {
  sub?: unknown;
  role?: unknown;
  exp?: unknown;
};

function decodeSession(token: string): Session | null {
  try {
    const [, base64Payload] = token.split('.');

    if (!base64Payload) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(base64Payload, 'base64url').toString('utf8'),
    ) as JwtPayload;
    const { sub, role, exp } = payload;
    const isValidRole = role === Role.ADMIN || role === Role.USER;
    const isExpired = typeof exp === 'number' && exp * 1000 <= Date.now();

    if (typeof sub !== 'number' || !isValidRole || isExpired) {
      return null;
    }

    return { token, userId: sub, role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? decodeSession(token) : null;
}

export async function setSession(token: string): Promise<Session> {
  const session = decodeSession(token);

  if (!session) {
    throw new Error('The API returned an invalid session.');
  }

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: ONE_HOUR,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return session;
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export async function requireRole(role: Role): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== role) {
    redirect(session.role === Role.ADMIN ? '/admin' : '/user');
  }

  return session;
}
