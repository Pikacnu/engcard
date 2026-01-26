import { db } from '@/db';
import { chatSessions } from '@/db/schema';
import { auth } from '@/utils';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json(
      {
        error: 'Not authenticated',
      },
      {
        status: 401,
      },
    );
  }

  const sessions = await db.query.chatSessions.findMany({
    where: eq(chatSessions.userId, session.user.id),
    orderBy: [desc(chatSessions.updatedAt)],
  });

  const chatList = sessions.map((chat) => {
    return {
      ...chat,
      _id: chat.id,
    };
  });

  return NextResponse.json(chatList);
}

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      {
        error: 'Not authenticated',
      },
      {
        status: 401,
      },
    );
  }
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
