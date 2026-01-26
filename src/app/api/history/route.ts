import { db } from '@/db';
import { histories } from '@/db/schema';
import { auth } from '@/utils/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { words, deckId, userId } = body;
  if (!deckId || !words) {
    return new Response('Bad Request', { status: 400 });
  }
  const session = await auth();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (userId && session.user?.id !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  await db.insert(histories).values({
    userId: session.user?.id || '',
    deckId,
    date: new Date(),
    words: Array.isArray(words) ? words : [words], // Ensure array
  });

  return new Response(
    JSON.stringify({
      success: 'save history',
    }),
    { status: 200 },
  );
}
