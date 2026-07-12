'use server';

import { redirect } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { buildRedirectPath } from '@/lib/navigation';
import { clearSession, setSession } from '@/lib/session';
import { Role, type ActionState } from '@/lib/types';

const apiClient = new ApiClient();

type LoginResponse = {
  accessToken: string;
};

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  let destination: '/admin' | '/user';

  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    const session = await setSession(response.accessToken);
    destination = session.role === Role.ADMIN ? '/admin' : '/user';
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  redirect(destination);
}

export async function signupAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    const response = await apiClient.post<LoginResponse>('/auth/signup', {
      fullName,
      email,
      password,
    });
    await setSession(response.accessToken);
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  redirect(buildRedirectPath('/user', { success: 'Account created.' }));
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect('/');
}
