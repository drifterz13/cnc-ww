import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignupForm } from './signup-form';
import { getSession } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect(session.role === Role.ADMIN ? '/admin' : '/user');
  }

  return (
    <main className="narrow">
      <h1>Sign up</h1>
      <SignupForm />
      <p>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </main>
  );
}
