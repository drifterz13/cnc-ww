'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signupAction } from '@/app/auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating account...' : 'Create account'}
    </button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, null);

  return (
    <form action={formAction}>
      {state?.error ? (
        <p role="alert" aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <label htmlFor="fullName">Full name</label>
      <input
        id="fullName"
        name="fullName"
        autoComplete="name"
        maxLength={120}
        required
      />

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
      />

      <label htmlFor="confirmPassword">Confirm password</label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
      />

      <SubmitButton />
    </form>
  );
}
