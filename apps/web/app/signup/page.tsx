import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignupForm } from './signup-form';
import { AuthShell } from '@/components/auth-shell';
import { getSession } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect(session.role === Role.ADMIN ? '/admin' : '/user');
  }

  return (
    <AuthShell
      description="Discover the concerts you love and reserve your free seat with confidence."
      quote="“Powering the tools that power the team.”"
    >
      <h1 className="text-center text-[40px] font-semibold leading-[1.5]">
        Sign Up
      </h1>
      <SignupForm />
      <p className="mt-9 text-center text-xl leading-9">
        Already have an account?{' '}
        <Link className="text-primary hover:underline" href="/login">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
