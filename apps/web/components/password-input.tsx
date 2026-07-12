'use client';

import { useState } from 'react';
import { EyeIcon } from './icons';
import { Icon } from './icon';

type PasswordInputProps = {
  autoComplete: string;
  id: string;
  maxLength?: number;
  minLength?: number;
  placeholder: string;
};

export function PasswordInput({
  autoComplete,
  id,
  maxLength,
  minLength,
  placeholder,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex h-12 items-center gap-3 rounded-control border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <Icon className="size-6 shrink-0" name="lock" />
      <input
        autoComplete={autoComplete}
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-placeholder"
        id={id}
        maxLength={maxLength}
        minLength={minLength}
        name={id}
        placeholder={placeholder}
        required
        type={isVisible ? 'text' : 'password'}
      />
      <button
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        className="inline-flex size-6 items-center justify-center"
        onClick={() => setIsVisible((value) => !value)}
        type="button"
      >
        {isVisible ? (
          <EyeIcon className="size-6" />
        ) : (
          <Icon className="size-6" name="visibility-off" />
        )}
      </button>
    </div>
  );
}
