'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from '@/app/auth/actions';
import { Icon } from '@/components/icon';
import { PasswordInput } from '@/components/password-input';

type LoginFormProps = {
  submitLabel?: string;
};

type SubmitButtonProps = {
  submitLabel: string;
};

function SubmitButton({ submitLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-[60px] w-full rounded-control bg-primary px-4 text-2xl font-medium text-surface transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Signing in...' : submitLabel}
    </button>
  );
}

export function LoginForm({ submitLabel = 'Login as User' }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, null);

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
          autoComplete="current-password"
          id="password"
          placeholder="Enter your Password"
        />
      </div>

      <SubmitButton submitLabel={submitLabel} />
    </form>
  );
}
