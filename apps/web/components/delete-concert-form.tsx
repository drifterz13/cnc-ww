'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CancelIcon } from './icons';
import { Icon } from './icon';

type DeleteConcertFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  concertName: string;
};

function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-12 flex-1 rounded-control bg-danger-confirm px-4 font-medium text-surface transition-colors hover:bg-danger-confirm/90 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Deleting...' : 'Yes, delete'}
    </button>
  );
}

export function DeleteConcertForm({
  action,
  concertName,
}: DeleteConcertFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex h-[60px] items-center justify-center gap-3 rounded-control bg-danger-admin px-5 text-2xl font-medium text-surface transition-colors hover:bg-danger-admin/90"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Icon className="size-6" name="trash" />
        Delete
      </button>

      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-modal flex items-center justify-center bg-ink/40 p-6"
          role="dialog"
        >
          <div className="w-full max-w-[422px] rounded-card border border-modal-border bg-surface p-6 text-center">
            <CancelIcon className="mx-auto size-12 text-danger-confirm" />
            <p className="mt-6 font-dialog text-xl font-bold leading-8">
              Are you sure you want to delete?
            </p>
            <p className="font-dialog text-xl font-bold leading-8">
              “{concertName}”
            </p>
            <div className="mt-7 flex gap-4">
              <button
                className="h-12 flex-1 rounded-control border border-neutral-border px-4 font-medium text-neutral-ink transition-colors hover:bg-page"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <form action={action} className="flex flex-1">
                <ConfirmButton />
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
