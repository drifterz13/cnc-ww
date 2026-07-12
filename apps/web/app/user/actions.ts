'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { buildRedirectPath } from '@/lib/navigation';
import { requireRole } from '@/lib/session';
import { Role } from '@/lib/types';

async function mutateReservation(
  concertId: number,
  method: 'POST' | 'DELETE',
): Promise<void> {
  const session = await requireRole(Role.USER);
  const apiClient = new ApiClient({ token: session.token });

  try {
    if (method === 'POST') {
      await apiClient.post(`/concerts/${concertId}/reservations`);
    } else {
      await apiClient.delete(`/concerts/${concertId}/reservations`);
    }
  } catch (error) {
    return redirect(
      buildRedirectPath('/user', { error: getErrorMessage(error) }),
    );
  }

  revalidatePath('/user');
  revalidatePath('/user/history');
  redirect(
    buildRedirectPath('/user', {
      success:
        method === 'POST' ? 'Reservation created.' : 'Reservation cancelled.',
    }),
  );
}

export async function reserveAction(concertId: number): Promise<void> {
  await mutateReservation(concertId, 'POST');
}

export async function cancelAction(concertId: number): Promise<void> {
  await mutateReservation(concertId, 'DELETE');
}
