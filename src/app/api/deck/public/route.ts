import { db } from '@/db';
import { cards, decks, savedDecks } from '@/db/schema';
import { auth } from '@/utils';
import { and, eq, inArray, not } from 'drizzle-orm';
import { CardProps } from '@/type';
import { DefinitionData } from '@/type-shared';

export async function POST(req: Request) {
  const { id: deckId } = await req.json();
  if (!deckId) {
    return Response.json({ error: 'Deck ID is required' }, { status: 400 });
  }
  const session = await auth();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, deckId),
  });

  if (!deck) {
    return Response.json({ error: 'Deck not found' }, { status: 404 });
  }
  if (!deck.isPublic) {
    return Response.json({ error: 'Deck is not public' }, { status: 403 });
  }
  if (deck.userId === userId) {
    return Response.json(
      { error: 'You cannot add your own deck' },
      { status: 403 },
    );
  }

  await db
    .insert(savedDecks)
    .values({
      userId: userId,
      deckId: deckId,
    })
    .onConflictDoNothing();

  return Response.json(
    {
      message: 'Deck added to your collection',
    },
    { status: 200 },
  );
}

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const userSavedDecks = await db.query.savedDecks.findMany({
    where: eq(savedDecks.userId, userId),
  });

  const savedDeckIds = userSavedDecks.map((d) => d.deckId);

  if (savedDeckIds.length === 0) {
    return Response.json({ decks: [] }, { status: 200 });
  }

  const resultDecks = await db
    .select()
    .from(decks)
    .where(
      and(
        inArray(decks.id, savedDeckIds),
        eq(decks.isPublic, true),
        not(eq(decks.userId, userId)),
      ),
    );

  const processedDecks = (
    await Promise.allSettled(
      resultDecks.map(async (deck) => {
        const firstCardData = (
          await db
            .select()
            .from(cards)
            .where(eq(cards.deckId, deck.id))
            .limit(1)
        )[0] as CardProps | undefined;
        if (!firstCardData) {
          throw new Error('No cards found');
        }
        const langs =
          firstCardData.blocks[0].definitions[0].definition.map(
            (d: DefinitionData) => d.lang,
          ) || [];
        const cardCount = await db.$count(cards, eq(cards.deckId, deck.id));

        return {
          _id: deck.id,
          id: deck.id,
          name: deck.name,
          isPublic: deck.isPublic,
          cardInfo: {
            length: cardCount || 0,
            langs: langs,
          },
        };
      }),
    )
  )
    .filter((res) => res.status === 'fulfilled')
    .map((res) => res.value);

  return Response.json({ decks: processedDecks }, { status: 200 });
}

export async function DELETE(req: Request) {
  const { deckId } = await req.json();
  if (!deckId) {
    return Response.json({ error: 'Deck ID is required' }, { status: 400 });
  }
  const session = await auth();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  await db
    .delete(savedDecks)
    .where(and(eq(savedDecks.userId, userId), eq(savedDecks.deckId, deckId)));

  return Response.json(
    {
      message: 'Deck removed from your collection',
    },
    { status: 200 },
  );
}
