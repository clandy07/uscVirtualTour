import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { geometries } from '@/db/schema';
import { requireAdmin } from '@/app/api/utils/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ geometryId: string; }> }
) {


}