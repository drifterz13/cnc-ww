import Link from 'next/link';
import { AuthShell } from './auth-shell';
import { LoginForm } from '@/app/login/login-form';

type LoginScreenProps = {
  description: string;
  quote: string;
  submitLabel: string;
};

export function LoginScreen({
  description,
  quote,
  submitLabel,
}: LoginScreenProps) {
  return (
    <AuthShell description={description} quote={quote}>
      <h1 className="text-center text-[40px] font-semibold leading-[1.5]">
        Login
      </h1>
      <LoginForm submitLabel={submitLabel} />
      <p className="mt-9 text-center text-xl leading-9">
        Don’t have an account?{' '}
        <Link className="text-primary hover:underline" href="/signup">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
