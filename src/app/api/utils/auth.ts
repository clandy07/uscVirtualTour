import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function checkAuth(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export async function requireAdmin(request: NextRequest) {
  const session = await checkAuth(request);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  const user = session.user;
  if (!user.is_admin) {
    return NextResponse.json(
      { error: 'Forbidden. Admin access required.' },
      { status: 403 }
    );
  }

  return null; // No error, user is admin
}
