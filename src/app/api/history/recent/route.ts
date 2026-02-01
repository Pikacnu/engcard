import { db } from '@/db';
import { histories } from '@/db/schema';
import { auth } from '@/utils';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recent = await db.query.histories.findMany({
      where: eq(histories.userId, session.user.id),
      orderBy: [desc(histories.date)],
      limit: 20,
    });
    return NextResponse.json(recent);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
