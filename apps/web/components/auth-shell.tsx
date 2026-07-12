import type { ReactNode } from 'react';

type AuthShellProps = {
  children: ReactNode;
  description: string;
  quote: string;
};

export function AuthShell({ children, description, quote }: AuthShellProps) {
  return (
    <main className="min-h-dvh bg-page lg:grid lg:grid-cols-2">
      <section className="hidden min-h-dvh flex-col justify-between bg-brand px-[100px] py-[clamp(2rem,10.7vh,6.875rem)] text-surface lg:flex">
        <div className="flex items-center gap-3 text-[40px] font-semibold leading-[1.5]">
          <span className="size-12 rounded-full bg-surface" />
          BRAND
        </div>
        <div className="max-w-[520px] space-y-8">
          <h2 className="text-balance text-[40px] font-semibold leading-[1.3]">
            {quote}
          </h2>
          <p className="max-w-[520px] text-base leading-[26px]">
            {description}
          </p>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-6 py-14 sm:px-12 lg:px-[100px] lg:py-[clamp(2rem,6.8vh,4.375rem)]">
        <div className="w-full max-w-[520px]">{children}</div>
      </section>
    </main>
  );
}
