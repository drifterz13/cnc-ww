'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { buildRedirectPath } from '@/lib/navigation';

export function NoticeToast() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  useEffect(() => {
    if (!error && !success) {
      return;
    }

    if (error) {
      toast.error(error);
    }

    if (success) {
      toast.success(success);
    }

    const params = Object.fromEntries(searchParams.entries());
    delete params.error;
    delete params.success;

    router.replace(buildRedirectPath(pathname, params));
  }, [error, pathname, router, searchParams, success]);

  return null;
}
