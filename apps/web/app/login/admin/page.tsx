import { redirect } from 'next/navigation';
import { LoginScreen } from '@/components/login-screen';
import { getSession } from '@/lib/session';
import { Role } from '@/lib/types';

export default async function AdminLoginPage() {
  const session = await getSession();

  if (session) {
    redirect(session.role === Role.ADMIN ? '/admin' : '/user');
  }

  return (
    <LoginScreen
      description="Manage concert listings and oversee reservation activity from one place."
      quote="“Powering the tools that power the team.”"
      submitLabel="Login as Administrator"
    />
  );
}
