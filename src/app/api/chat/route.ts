import db from '@/lib/db';
import { ChatSession, WithStringObjectId } from '@/type';
import { auth } from '@/utils';
import { WithId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
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

  const chatSessions: WithId<ChatSession>[] = await db
    .collection<ChatSession>('chat')
    .find({
      userId: session.user?.id,
    })
    .toArray();

  const chatList: WithStringObjectId<ChatSession>[] = chatSessions.map(
    (chat) => {
      return {
        ...chat,
        _id: chat._id.toString(),
      };
    },
  );

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

  const chatSession = await db.collection<ChatSession>('chat').insertOne({
    //@ts-expect-error Comment
    userId: session.user?.id || '',
    history: [],
    chatName: 'New Chat',
  });

  return NextResponse.json({
    id: chatSession.insertedId.toString(),
  });
}
