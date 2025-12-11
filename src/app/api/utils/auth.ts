import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { authUser } from "@/types";
import { UserRole } from '@/types';
import { db } from '@/index';
import { user_org_relations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { string } from 'better-auth';


export async function checkAuth(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export async function minAuthStudent(request: NextRequest) {
  const session = await checkAuth(request);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  return null; // No error, user is at minimum have student auth
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


export const getUserRole = (userObj: authUser): UserRole => {
  if(userObj.is_student){
    return 'student'
  }
  else if(userObj.is_admin){
    return 'admin'
  }
  else{
    return 'guest'
  }
};

export async function getUserOrgs(userObj: authUser) {
  const userOrgsTemp = await db.select({
    org_id: user_org_relations.org_id
  }).from(user_org_relations).where(eq(user_org_relations.user_id, userObj.id))

  const userOrgs: number[] = []
  userOrgsTemp.map((org) => userOrgs.push(org.org_id))
  return userOrgs;
}

export async function getUserOrgPermissions(userObj: authUser, orgId: number):Promise<
{ can_post_events: boolean; can_add_members: boolean; can_remove_members: boolean; can_set_member_permissions: boolean; }>{
  const userOrgPermissionsTemp = await db.select({
    can_post_events: user_org_relations.can_post_events,
    can_add_members: user_org_relations.can_add_members,
    can_remove_members: user_org_relations.can_remove_members,
    can_set_member_permissions: user_org_relations.can_set_member_permissions
  }).from(user_org_relations).where(
    and(
      eq(user_org_relations.user_id, userObj.id),
      eq(user_org_relations.org_id, orgId)
    )
  )

  const userOrgPermissions = userOrgPermissionsTemp[0]
  return userOrgPermissions;
}