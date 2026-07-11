'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { buildRedirectPath } from '@/lib/navigation';
import { requireRole } from '@/lib/session';
import { Role } from '@/lib/types';

export async function createConcertAction(formData: FormData): Promise<void> {
  const session = await requireRole(Role.ADMIN);
  const apiClient = new ApiClient({ token: session.token });
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const totalSeats = Number(formData.get('totalSeats'));

  try {
    await apiClient.post('/concerts', { name, description, totalSeats });
  } catch (error) {
    redirect(buildRedirectPath('/admin', { error: getErrorMessage(error) }));
  }

  revalidatePath('/admin');
  redirect(buildRedirectPath('/admin', { success: 'Concert created.' }));
}

export async function deleteConcertAction(concertId: number): Promise<void> {
  const session = await requireRole(Role.ADMIN);
  const apiClient = new ApiClient({ token: session.token });

  try {
    await apiClient.delete(`/concerts/${concertId}`);
  } catch (error) {
    redirect(buildRedirectPath('/admin', { error: getErrorMessage(error) }));
  }

  revalidatePath('/admin');
  redirect(buildRedirectPath('/admin', { success: 'Concert deleted.' }));
}
