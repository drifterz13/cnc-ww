'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signupAction } from '@/app/auth/actions';
import { Icon } from '@/components/icon';
import { PasswordInput } from '@/components/password-input';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-[60px] w-full rounded-control bg-primary px-4 text-2xl font-medium text-surface transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Creating account...' : 'Create an account'}
    </button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, null);

  return (
    <form action={formAction} className="mt-9 space-y-9">
      {state?.error ? (
        <p
          aria-live="polite"
          className="rounded-control border border-danger-confirm bg-danger-confirm/10 px-3 py-2 text-sm text-danger-confirm"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-4">
        <label className="block text-2xl leading-9" htmlFor="fullName">
          Full name
        </label>
        <div className="flex h-12 items-center gap-3 rounded-control border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <Icon className="size-6 shrink-0" name="user-dark" />
          <input
            autoComplete="name"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-placeholder"
            id="fullName"
            maxLength={120}
            name="fullName"
            placeholder="Enter your Full Name"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-2xl leading-9" htmlFor="email">
          Email
        </label>
        <div className="flex h-12 items-center gap-3 rounded-control border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <Icon className="size-6 shrink-0" name="user-dark" />
          <input
            autoComplete="email"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-placeholder"
            id="email"
            name="email"
            placeholder="Enter your Email Address"
            required
            type="email"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-2xl leading-9" htmlFor="password">
          Password
        </label>
        <PasswordInput
          autoComplete="new-password"
          id="password"
          maxLength={128}
          minLength={8}
          placeholder="Create a Password"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-2xl leading-9" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <PasswordInput
          autoComplete="new-password"
          id="confirmPassword"
          maxLength={128}
          minLength={8}
          placeholder="Re-enter your Password"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
