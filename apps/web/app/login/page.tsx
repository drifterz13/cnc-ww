import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from './login-form';
import { getSession } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect(session.role === Role.ADMIN ? '/admin' : '/user');
  }

  return (
    <main className="narrow">
      <h1>Sign in</h1>
      <LoginForm />
      <p>
        Need an account? <Link href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
